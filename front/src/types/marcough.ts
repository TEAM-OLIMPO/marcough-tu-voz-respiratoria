export interface Profile {
  id: string;
  nombre: string;
  grupoEdad: 'nino' | 'adulto' | 'adulto_mayor';
  condicionesPrevias: ('asma' | 'epoc' | 'fibrosis_pulmonar' | 'apnea_sueno' | 'ninguna')[];
}

export interface Sintomas {
  duracionTos: 'menos_24h' | '1_3_dias' | 'mas_3_dias';
  fiebre: boolean;
  dificultadRespirar: 'no' | 'leve' | 'moderada' | 'severa';
  dolorPecho: boolean;
  sibilancias: boolean;
  nivelEnergia: 'normal' | 'bajo' | 'muy_bajo';
}

export interface AnalysisResult {
  patron_tos: 'tos_explosiva' | 'tos_frecuente' | 'tos_con_silbido' | 'tos_suave' | 'indefinida';
  categoria_clinica: 'ira_leve' | 'ira_moderada_grave' | 'asma_posible' | 'epoc_cronica_posible' | 'bajo_riesgo';
  descripcion_categoria: string;
  puntaje_riesgo: number;
  nivel_riesgo: 'bajo' | 'medio' | 'alto';
  mensaje_riesgo: string;
  recomendaciones_preventivas: string;
  signos_alarma: string[];
}

export interface HistoryEntry {
  id: string;
  fecha: string;
  perfilId: string;
  perfilNombre: string;
  sintomas: Sintomas;
  resultado: AnalysisResult;
}
