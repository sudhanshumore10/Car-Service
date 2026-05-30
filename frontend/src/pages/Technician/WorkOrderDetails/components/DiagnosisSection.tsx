import React from "react";

import "./DiagnosisSection.css";
type Diagnosis = {
  checklist: string[];
  notes: string;
};
type WorkOrderData = {
  diagnosis: Diagnosis;
  estimate: {
    services: any[];
    parts: any[];
    tax: number;
    discount: number;
  };
  approval: {
    status: string;
    approvedAt: string | null;
  };
};
type Props = {
  data: Diagnosis;
  setWorkOrderData: React.Dispatch<React.SetStateAction<WorkOrderData>>;
};


const DIAGNOSIS_OPTIONS = [
  "Engine Issue",
  "Brake Problem",
  "Oil Leakage",
  "Battery Fault",
  "Electrical Issue",
];

const DiagnosisSection: React.FC<Props> = ({
  data,
  setWorkOrderData,
}) => {

  const handleChecklistChange = (item: string) => {
    setWorkOrderData((prev: WorkOrderData) => {
      const exists = prev.diagnosis.checklist.includes(item);
      const updatedChecklist = exists
        ? prev.diagnosis.checklist.filter((i) => i !== item)
        : [...prev.diagnosis.checklist, item];
      return {
        ...prev,
        diagnosis: {
          ...prev.diagnosis,
          checklist: updatedChecklist,
        },
      };
    });
  };

  const handleNotesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setWorkOrderData((prev: WorkOrderData) => ({
      ...prev,
      diagnosis: {
        ...prev.diagnosis,
        notes: value,
      },
    }));
  };


  return (
    <div className="diagnosis-section">
      <h3>Diagnosis</h3>

      <div className="checklist">
        {DIAGNOSIS_OPTIONS.map((item: string) => (
          <label key={item} className="checkbox-item">
            <input
              type="checkbox"
              checked={data.checklist.includes(item)}
              onChange={() => handleChecklistChange(item)}
            />
            {item}
          </label>
        ))}
      </div>

      <div className="notes">
        <textarea
          placeholder="Enter diagnosis notes..."
          value={data.notes}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  );

};

export default DiagnosisSection;

