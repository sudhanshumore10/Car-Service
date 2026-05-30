package com.infy.carservice.scheduling.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infy.carservice.scheduling.dto.AddonCatalogItemDTO;
import com.infy.carservice.scheduling.dto.CatalogOverviewDTO;
import com.infy.carservice.scheduling.dto.ServiceCatalogItemDTO;
import com.infy.carservice.scheduling.dto.ServicePackageCatalogItemDTO;
import com.infy.carservice.scheduling.dto.ServicePriceHistoryDTO;
import com.infy.carservice.scheduling.entity.CarService;
import com.infy.carservice.scheduling.repository.ServiceRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class CatalogManagementService {

    @Autowired
    private ServiceRepository serviceRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CatalogOverviewDTO getManagerOverview() {
        ensureCatalogTables();
        CatalogOverviewDTO dto = new CatalogOverviewDTO();
        dto.setServices(getManagerServices());
        dto.setPackages(getManagerPackages());
        dto.setAddOns(getManagerAddOns());
        dto.setPriceHistory(getPriceHistory());
        return dto;
    }

    public List<ServiceCatalogItemDTO> getCustomerServices() {
        return getManagerServices().stream()
            .filter(item -> Boolean.TRUE.equals(item.getActive()))
            .collect(Collectors.toList());
    }

    public List<ServicePackageCatalogItemDTO> getCustomerPackages() {
        return getManagerPackages().stream()
            .filter(item -> Boolean.TRUE.equals(item.getActive()))
            .collect(Collectors.toList());
    }

    public List<AddonCatalogItemDTO> getCustomerAddOns() {
        return getManagerAddOns().stream()
            .filter(item -> Boolean.TRUE.equals(item.getActive()))
            .collect(Collectors.toList());
    }

    public List<ServiceCatalogItemDTO> getManagerServices() {
        ensureCatalogTables();
        Map<Long, Map<String, Object>> extras = loadServiceExtras();
        return serviceRepository.findAll().stream()
            .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
            .map(service -> toServiceDto(service, extras.get(service.getId())))
            .collect(Collectors.toList());
    }

    public ServiceCatalogItemDTO createService(ServiceCatalogItemDTO dto, String changedBy) {
        ensureCatalogTables();
        CarService service = new CarService();
        applyServiceFields(service, dto);
        CarService saved = serviceRepository.save(service);
        upsertServiceExt(saved.getId(), dto);
        return toServiceDto(saved, loadServiceExtra(saved.getId()));
    }

    public ServiceCatalogItemDTO updateService(Long id, ServiceCatalogItemDTO dto, String changedBy) {
        ensureCatalogTables();
        CarService service = serviceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        BigDecimal oldPrice = defaultMoney(service.getBasePrice());
        applyServiceFields(service, dto);
        CarService saved = serviceRepository.save(service);
        upsertServiceExt(saved.getId(), dto);
        if (oldPrice.compareTo(defaultMoney(saved.getBasePrice())) != 0) {
            insertPriceHistory(saved.getId(), oldPrice, saved.getBasePrice(), changedBy);
        }
        return toServiceDto(saved, loadServiceExtra(saved.getId()));
    }

    public ServiceCatalogItemDTO updateServiceActive(Long id, Boolean active) {
        ensureCatalogTables();
        CarService service = serviceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setIsActive(Boolean.TRUE.equals(active));
        CarService saved = serviceRepository.save(service);
        entityManager.createNativeQuery(
                "update service_catalog_ext set is_active = ? where service_id = ?")
            .setParameter(1, Boolean.TRUE.equals(active))
            .setParameter(2, id)
            .executeUpdate();
        return toServiceDto(saved, loadServiceExtra(saved.getId()));
    }

    public List<ServicePackageCatalogItemDTO> getManagerPackages() {
        ensureCatalogTables();
        List<Object[]> rows = entityManager.createNativeQuery("""
            select p.id, p.name, p.description, p.price,
                   coalesce(ext.is_active, true) as is_active,
                   coalesce(ext.category, 'General') as category,
                   coalesce(ext.tax_percent, 18.00) as tax_percent,
                   coalesce(ext.discount, 0.00) as discount
            from service_packages p
            left join service_package_ext ext on ext.package_id = p.id
            order by p.name
        """).getResultList();

        List<ServicePackageCatalogItemDTO> packages = new ArrayList<>();
        for (Object[] row : rows) {
            ServicePackageCatalogItemDTO dto = new ServicePackageCatalogItemDTO();
            dto.setId(toLong(row[0]));
            dto.setName(toString(row[1]));
            dto.setDescription(toString(row[2]));
            dto.setPrice(toBigDecimal(row[3]));
            dto.setActive(toBoolean(row[4]));
            dto.setCategory(toString(row[5]));
            dto.setTaxPercent(toBigDecimal(row[6]));
            dto.setDiscount(toBigDecimal(row[7]));
            dto.setServiceIds(loadPackageServiceIds(dto.getId()));
            dto.setServiceNames(loadPackageServiceNames(dto.getId()));
            packages.add(dto);
        }
        return packages;
    }

    public ServicePackageCatalogItemDTO createPackage(ServicePackageCatalogItemDTO dto) {
        ensureCatalogTables();
        validatePackage(dto);
        entityManager.createNativeQuery(
                "insert into service_packages (name, description, price) values (?, ?, ?)")
            .setParameter(1, trimRequired(dto.getName(), "Package name is required"))
            .setParameter(2, trimToEmpty(dto.getDescription()))
            .setParameter(3, defaultMoney(dto.getPrice()))
            .executeUpdate();
        Long packageId = toLong(entityManager.createNativeQuery("select last_insert_id()").getSingleResult());
        upsertPackageExt(packageId, dto);
        replacePackageItems(packageId, dto.getServiceIds());
        return findPackage(packageId);
    }

    public ServicePackageCatalogItemDTO updatePackage(Long id, ServicePackageCatalogItemDTO dto) {
        ensureCatalogTables();
        validatePackage(dto);
        entityManager.createNativeQuery(
                "update service_packages set name = ?, description = ?, price = ? where id = ?")
            .setParameter(1, trimRequired(dto.getName(), "Package name is required"))
            .setParameter(2, trimToEmpty(dto.getDescription()))
            .setParameter(3, defaultMoney(dto.getPrice()))
            .setParameter(4, id)
            .executeUpdate();
        upsertPackageExt(id, dto);
        replacePackageItems(id, dto.getServiceIds());
        return findPackage(id);
    }

    public ServicePackageCatalogItemDTO updatePackageActive(Long id, Boolean active) {
        ensureCatalogTables();
        ensurePackageExists(id);
        entityManager.createNativeQuery(
                "insert into service_package_ext (package_id, is_active, category, tax_percent, discount) " +
                "values (?, ?, 'General', 18.00, 0.00) " +
                "on duplicate key update is_active = values(is_active)")
            .setParameter(1, id)
            .setParameter(2, Boolean.TRUE.equals(active))
            .executeUpdate();
        return findPackage(id);
    }

    public List<AddonCatalogItemDTO> getManagerAddOns() {
        ensureCatalogTables();
        List<Object[]> rows = entityManager.createNativeQuery("""
            select a.id, a.name, a.price,
                   coalesce(ext.description, '') as description,
                   coalesce(ext.is_active, true) as is_active,
                   coalesce(ext.duration_minutes, 0) as duration_minutes,
                   coalesce(ext.excluded_addon_ids, '') as excluded_addon_ids
            from add_ons a
            left join addon_ext ext on ext.addon_id = a.id
            order by a.name
        """).getResultList();

        List<AddonCatalogItemDTO> addOns = new ArrayList<>();
        for (Object[] row : rows) {
            AddonCatalogItemDTO dto = new AddonCatalogItemDTO();
            dto.setId(toLong(row[0]));
            dto.setName(toString(row[1]));
            dto.setPrice(toBigDecimal(row[2]));
            dto.setDescription(toString(row[3]));
            dto.setActive(toBoolean(row[4]));
            dto.setDurationMinutes(toInteger(row[5], 0));
            List<Long> excludedIds = parseIdList(toString(row[6]));
            dto.setExcludedAddonIds(excludedIds);
            dto.setExcludedAddonNames(loadAddonNames(excludedIds));
            addOns.add(dto);
        }
        return addOns;
    }

    public AddonCatalogItemDTO createAddOn(AddonCatalogItemDTO dto) {
        ensureCatalogTables();
        validateAddon(dto);
        entityManager.createNativeQuery(
                "insert into add_ons (name, price) values (?, ?)")
            .setParameter(1, trimRequired(dto.getName(), "Add-on name is required"))
            .setParameter(2, defaultMoney(dto.getPrice()))
            .executeUpdate();
        Long addonId = toLong(entityManager.createNativeQuery("select last_insert_id()").getSingleResult());
        upsertAddonExt(addonId, dto);
        return findAddon(addonId);
    }

    public AddonCatalogItemDTO updateAddOn(Long id, AddonCatalogItemDTO dto) {
        ensureCatalogTables();
        validateAddon(dto);
        entityManager.createNativeQuery(
                "update add_ons set name = ?, price = ? where id = ?")
            .setParameter(1, trimRequired(dto.getName(), "Add-on name is required"))
            .setParameter(2, defaultMoney(dto.getPrice()))
            .setParameter(3, id)
            .executeUpdate();
        upsertAddonExt(id, dto);
        return findAddon(id);
    }

    public AddonCatalogItemDTO updateAddOnActive(Long id, Boolean active) {
        ensureCatalogTables();
        ensureAddonExists(id);
        entityManager.createNativeQuery(
                "insert into addon_ext (addon_id, description, is_active, duration_minutes, excluded_addon_ids) " +
                "values (?, '', ?, 0, null) " +
                "on duplicate key update is_active = values(is_active)")
            .setParameter(1, id)
            .setParameter(2, Boolean.TRUE.equals(active))
            .executeUpdate();
        return findAddon(id);
    }

    public List<ServicePriceHistoryDTO> getPriceHistory() {
        ensureCatalogTables();
        List<Object[]> rows = entityManager.createNativeQuery("""
            select h.id, h.service_id, s.name, h.old_price, h.new_price, h.changed_at, h.changed_by
            from service_price_history h
            join services s on s.id = h.service_id
            order by h.changed_at desc
        """).getResultList();

        List<ServicePriceHistoryDTO> history = new ArrayList<>();
        for (Object[] row : rows) {
            ServicePriceHistoryDTO dto = new ServicePriceHistoryDTO();
            dto.setId(toLong(row[0]));
            dto.setServiceId(toLong(row[1]));
            dto.setServiceName(toString(row[2]));
            dto.setOldPrice(toBigDecimal(row[3]));
            dto.setNewPrice(toBigDecimal(row[4]));
            dto.setChangedAt(toLocalDateTime(row[5]));
            dto.setChangedBy(toString(row[6]));
            history.add(dto);
        }
        return history;
    }

    private ServiceCatalogItemDTO toServiceDto(CarService service, Map<String, Object> extra) {
        ServiceCatalogItemDTO dto = new ServiceCatalogItemDTO();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setDurationMinutes(service.getDurationMinutes());
        dto.setBufferMinutes(service.getBufferMinutes());
        dto.setBasePrice(defaultMoney(service.getBasePrice()));
        dto.setActive(Boolean.TRUE.equals(service.getIsActive()) && extraBoolean(extra, "is_active", true));
        dto.setCategory(extraString(extra, "category", "General"));
        dto.setTags(extraString(extra, "tags", ""));
        dto.setWhatIncluded(extraString(extra, "what_included", ""));
        dto.setTaxPercent(extraMoney(extra, "tax_percent", new BigDecimal("18.00")));
        dto.setDiscount(extraMoney(extra, "discount", BigDecimal.ZERO));
        return dto;
    }

    private void applyServiceFields(CarService service, ServiceCatalogItemDTO dto) {
        service.setName(trimRequired(dto.getName(), "Service name is required"));
        service.setDescription(trimToEmpty(dto.getDescription()));
        service.setDurationMinutes(Math.max(0, dto.getDurationMinutes() == null ? 0 : dto.getDurationMinutes()));
        service.setBufferMinutes(Math.max(0, dto.getBufferMinutes() == null ? 0 : dto.getBufferMinutes()));
        service.setBasePrice(defaultMoney(dto.getBasePrice()));
        service.setIsActive(dto.getActive() == null ? Boolean.TRUE : dto.getActive());
    }

    private void upsertServiceExt(Long serviceId, ServiceCatalogItemDTO dto) {
        entityManager.createNativeQuery(
                "insert into service_catalog_ext (service_id, tax_percent, discount, category, tags, what_included, is_active) " +
                "values (?, ?, ?, ?, ?, ?, ?) " +
                "on duplicate key update tax_percent = values(tax_percent), discount = values(discount), " +
                "category = values(category), tags = values(tags), what_included = values(what_included), is_active = values(is_active)")
            .setParameter(1, serviceId)
            .setParameter(2, dto.getTaxPercent() == null ? new BigDecimal("18.00") : dto.getTaxPercent())
            .setParameter(3, defaultMoney(dto.getDiscount()))
            .setParameter(4, trimToDefault(dto.getCategory(), "General"))
            .setParameter(5, trimToEmpty(dto.getTags()))
            .setParameter(6, trimToEmpty(dto.getWhatIncluded()))
            .setParameter(7, dto.getActive() == null ? Boolean.TRUE : dto.getActive())
            .executeUpdate();
    }

    private void upsertPackageExt(Long packageId, ServicePackageCatalogItemDTO dto) {
        entityManager.createNativeQuery(
                "insert into service_package_ext (package_id, is_active, category, tax_percent, discount) " +
                "values (?, ?, ?, ?, ?) " +
                "on duplicate key update is_active = values(is_active), category = values(category), " +
                "tax_percent = values(tax_percent), discount = values(discount)")
            .setParameter(1, packageId)
            .setParameter(2, dto.getActive() == null ? Boolean.TRUE : dto.getActive())
            .setParameter(3, trimToDefault(dto.getCategory(), "General"))
            .setParameter(4, dto.getTaxPercent() == null ? new BigDecimal("18.00") : dto.getTaxPercent())
            .setParameter(5, defaultMoney(dto.getDiscount()))
            .executeUpdate();
    }

    private void replacePackageItems(Long packageId, List<Long> serviceIds) {
        entityManager.createNativeQuery("delete from service_package_items where package_id = ?")
            .setParameter(1, packageId)
            .executeUpdate();
        for (Long serviceId : sanitizeIds(serviceIds)) {
            ensureServiceExists(serviceId);
            entityManager.createNativeQuery(
                    "insert into service_package_items (package_id, service_id) values (?, ?)")
                .setParameter(1, packageId)
                .setParameter(2, serviceId)
                .executeUpdate();
        }
    }

    private void upsertAddonExt(Long addonId, AddonCatalogItemDTO dto) {
        entityManager.createNativeQuery(
                "insert into addon_ext (addon_id, description, is_active, duration_minutes, excluded_addon_ids) " +
                "values (?, ?, ?, ?, ?) " +
                "on duplicate key update description = values(description), is_active = values(is_active), " +
                "duration_minutes = values(duration_minutes), excluded_addon_ids = values(excluded_addon_ids)")
            .setParameter(1, addonId)
            .setParameter(2, trimToEmpty(dto.getDescription()))
            .setParameter(3, dto.getActive() == null ? Boolean.TRUE : dto.getActive())
            .setParameter(4, dto.getDurationMinutes() == null ? 0 : Math.max(0, dto.getDurationMinutes()))
            .setParameter(5, joinIds(dto.getExcludedAddonIds()))
            .executeUpdate();
    }

    private void insertPriceHistory(Long serviceId, BigDecimal oldPrice, BigDecimal newPrice, String changedBy) {
        entityManager.createNativeQuery(
                "insert into service_price_history (service_id, old_price, new_price, changed_at, changed_by) values (?, ?, ?, ?, ?)")
            .setParameter(1, serviceId)
            .setParameter(2, defaultMoney(oldPrice))
            .setParameter(3, defaultMoney(newPrice))
            .setParameter(4, Timestamp.valueOf(LocalDateTime.now()))
            .setParameter(5, trimToDefault(changedBy, "SYSTEM"))
            .executeUpdate();
    }

    private Map<Long, Map<String, Object>> loadServiceExtras() {
        ensureCatalogTables();
        List<Object[]> rows = entityManager.createNativeQuery("""
            select service_id, tax_percent, discount, category, tags, what_included, is_active
            from service_catalog_ext
        """).getResultList();

        Map<Long, Map<String, Object>> extras = new LinkedHashMap<>();
        for (Object[] row : rows) {
            Map<String, Object> values = new LinkedHashMap<>();
            values.put("tax_percent", row[1]);
            values.put("discount", row[2]);
            values.put("category", row[3]);
            values.put("tags", row[4]);
            values.put("what_included", row[5]);
            values.put("is_active", row[6]);
            extras.put(toLong(row[0]), values);
        }
        return extras;
    }

    private void ensureCatalogTables() {
        entityManager.createNativeQuery("""
            create table if not exists service_catalog_ext (
                service_id bigint primary key,
                tax_percent decimal(5,2) default 18.00,
                discount decimal(10,2) default 0.00,
                category varchar(100) default 'General',
                tags varchar(255),
                what_included text,
                is_active boolean default true,
                foreign key (service_id) references services(id)
            )
        """).executeUpdate();

        entityManager.createNativeQuery("""
            create table if not exists service_package_ext (
                package_id bigint primary key,
                is_active boolean default true,
                category varchar(100) default 'General',
                tax_percent decimal(5,2) default 18.00,
                discount decimal(10,2) default 0.00,
                foreign key (package_id) references service_packages(id)
            )
        """).executeUpdate();

        entityManager.createNativeQuery("""
            create table if not exists addon_ext (
                addon_id bigint primary key,
                description text,
                is_active boolean default true,
                duration_minutes int default 0,
                excluded_addon_ids varchar(255),
                foreign key (addon_id) references add_ons(id)
            )
        """).executeUpdate();

        entityManager.createNativeQuery("""
            create table if not exists service_price_history (
                id bigint auto_increment primary key,
                service_id bigint,
                old_price decimal(10,2),
                new_price decimal(10,2),
                changed_at timestamp default current_timestamp,
                changed_by varchar(100),
                foreign key (service_id) references services(id)
            )
        """).executeUpdate();
    }

    private Map<String, Object> loadServiceExtra(Long serviceId) {
        return loadServiceExtras().get(serviceId);
    }

    private ServicePackageCatalogItemDTO findPackage(Long packageId) {
        return getManagerPackages().stream()
            .filter(item -> packageId.equals(item.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Package not found"));
    }

    private AddonCatalogItemDTO findAddon(Long addonId) {
        return getManagerAddOns().stream()
            .filter(item -> addonId.equals(item.getId()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Add-on not found"));
    }

    private List<Long> loadPackageServiceIds(Long packageId) {
        List<?> rows = entityManager.createNativeQuery(
                "select service_id from service_package_items where package_id = ? order by service_id")
            .setParameter(1, packageId)
            .getResultList();
        return rows.stream().map(this::toLong).collect(Collectors.toList());
    }

    private List<String> loadPackageServiceNames(Long packageId) {
        List<?> rows = entityManager.createNativeQuery("""
            select s.name
            from service_package_items spi
            join services s on s.id = spi.service_id
            where spi.package_id = ?
            order by s.name
        """).setParameter(1, packageId).getResultList();
        return rows.stream().map(this::toString).collect(Collectors.toList());
    }

    private List<String> loadAddonNames(List<Long> addonIds) {
        if (addonIds == null || addonIds.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> names = new ArrayList<>();
        for (Long addonId : addonIds) {
            Object result = entityManager.createNativeQuery("select name from add_ons where id = ?")
                .setParameter(1, addonId)
                .getSingleResult();
            names.add(toString(result));
        }
        return names;
    }

    private void validatePackage(ServicePackageCatalogItemDTO dto) {
        if (trimToNull(dto.getName()) == null) {
            throw new RuntimeException("Package name is required");
        }
        if (sanitizeIds(dto.getServiceIds()).isEmpty()) {
            throw new RuntimeException("Choose at least one service for the package");
        }
    }

    private void validateAddon(AddonCatalogItemDTO dto) {
        if (trimToNull(dto.getName()) == null) {
            throw new RuntimeException("Add-on name is required");
        }
    }

    private void ensureServiceExists(Long serviceId) {
        if (serviceId == null || !serviceRepository.existsById(serviceId)) {
            throw new RuntimeException("Service not found for package item: " + serviceId);
        }
    }

    private void ensurePackageExists(Long packageId) {
        Number count = (Number) entityManager.createNativeQuery(
                "select count(*) from service_packages where id = ?")
            .setParameter(1, packageId)
            .getSingleResult();
        if (count == null || count.longValue() == 0L) {
            throw new RuntimeException("Package not found");
        }
    }

    private void ensureAddonExists(Long addonId) {
        Number count = (Number) entityManager.createNativeQuery(
                "select count(*) from add_ons where id = ?")
            .setParameter(1, addonId)
            .getSingleResult();
        if (count == null || count.longValue() == 0L) {
            throw new RuntimeException("Add-on not found");
        }
    }

    private List<Long> sanitizeIds(List<Long> ids) {
        if (ids == null) {
            return Collections.emptyList();
        }
        return ids.stream()
            .filter(id -> id != null && id > 0)
            .distinct()
            .collect(Collectors.toList());
    }

    private List<Long> parseIdList(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(raw.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(Long::parseLong)
            .distinct()
            .collect(Collectors.toList());
    }

    private String joinIds(List<Long> ids) {
        List<Long> cleaned = sanitizeIds(ids);
        if (cleaned.isEmpty()) {
            return null;
        }
        return cleaned.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private String trimRequired(String value, String message) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new RuntimeException(message);
        }
        return trimmed;
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String trimToDefault(String value, String fallback) {
        String trimmed = trimToNull(value);
        return trimmed == null ? fallback : trimmed;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }

    private Integer toInteger(Object value, int fallback) {
        if (value == null) {
            return fallback;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private Boolean toBoolean(Object value) {
        if (value == null) {
            return Boolean.FALSE;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value instanceof Number number) {
            return number.intValue() != 0;
        }
        return Boolean.parseBoolean(String.valueOf(value));
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (value instanceof BigDecimal decimal) {
            return decimal.setScale(2, RoundingMode.HALF_UP);
        }
        return new BigDecimal(String.valueOf(value)).setScale(2, RoundingMode.HALF_UP);
    }

    private String toString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (value instanceof LocalDateTime dateTime) {
            return dateTime;
        }
        return LocalDateTime.parse(String.valueOf(value).replace(" ", "T"));
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null
            ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
            : value.setScale(2, RoundingMode.HALF_UP);
    }

    private String extraString(Map<String, Object> extra, String key, String fallback) {
        if (extra == null || extra.get(key) == null) {
            return fallback;
        }
        return toString(extra.get(key));
    }

    private boolean extraBoolean(Map<String, Object> extra, String key, boolean fallback) {
        if (extra == null || extra.get(key) == null) {
            return fallback;
        }
        return toBoolean(extra.get(key));
    }

    private BigDecimal extraMoney(Map<String, Object> extra, String key, BigDecimal fallback) {
        if (extra == null || extra.get(key) == null) {
            return defaultMoney(fallback);
        }
        return toBigDecimal(extra.get(key));
    }
}
