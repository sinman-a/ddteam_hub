export interface KPIValue {
  value: number;
  unit: string;
  items?: KPIItem[];
}

export interface KPIItem {
  id: number;
  title: string;
  assignee?: string;
  age?: number;
  reason?: string;
}

export interface KPIMetric {
  name: string;
  label: string;
  description: string;
  unit: string;
  period: number;
  value: number | null;
  items?: KPIItem[];
  updatedAt: string | null;
}
