import "./RoleCard.css";
type Props = {
    title: string;
    icon: string;
    hoverIcon: string;
    onClick: () => void;
};
const RoleCard = ({ title, icon, hoverIcon, onClick }: Props) => {
    return (
        <div className="role-card" onClick={onClick}>
            <img src={icon} alt={title} className="role-iconn normal" />
            <img src={hoverIcon} alt={title} className="role-icon hover" />
            <h4>{title}</h4></div>
    );
};
export default RoleCard;