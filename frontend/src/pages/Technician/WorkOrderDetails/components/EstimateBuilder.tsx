import React from "react";

import ServicesList from "./ServicesList";

import PartsList from "./PartsList";

import PricingSummary from "./PricingSummary";

const EstimateBuilder = ({ data, setWorkOrderData }: any) => {

  return (

    <div>

      <h3>Estimate Builder</h3>
      <ServicesList
        services={data.services}
        setWorkOrderData={setWorkOrderData}
      />
      <PartsList
        parts={data.parts}
        setWorkOrderData={setWorkOrderData}
      />
      <PricingSummary
        data={data}
        setWorkOrderData={setWorkOrderData}
      />
    </div>
  );
};

export default EstimateBuilder;

