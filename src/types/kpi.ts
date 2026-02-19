import type { FunctionalComponent } from 'vue'

export interface KpiData { 
  id: string; 
  description: string; 
  number: number; 
  format: string 
}

export interface Kpi extends KpiData { 
  icon: FunctionalComponent
}