import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Sintomas {
  duracionTos: 'menos_24h' | '1_3_dias' | 'mas_3_dias';
  fiebre: boolean;
  dificultadRespirar: 'no' | 'leve' | 'moderada' | 'severa';
  dolorPecho: boolean;
  sibilancias: boolean;
  nivelEnergia: 'normal' | 'bajo' | 'muy_bajo';
}

interface Perfil {
  grupoEdad: 'nino' | 'adulto' | 'adulto_mayor';
  condicionesPrevias: string[];
}

const SYSTEM_PROMPT = `Eres un asistente de evaluación de riesgo respiratorio llamado Marcough, diseñado para el contexto colombiano. Tu función es analizar síntomas y patrones de tos para proporcionar evaluaciones de riesgo preventivas.

REGLAS CRÍTICAS:
1. NUNCA proporciones diagnósticos médicos. Solo describes patrones, categorías clínicas compatibles y niveles de riesgo.
2. Siempre incluye el mensaje: "Esta evaluación NO es un diagnóstico médico."
3. Todas las respuestas DEBEN estar en español.
4. Adapta tus recomendaciones al contexto de salud colombiano.

PATRONES DE TOS:
- tos_explosiva: Tos fuerte y súbita, típica de irritación o infección
- tos_frecuente: Tos repetitiva a intervalos cortos
- tos_con_silbido: Tos acompañada de sibilancias (compatible con asma/EPOC)
- tos_suave: Tos leve y poco productiva
- indefinida: No se puede determinar un patrón claro

CATEGORÍAS CLÍNICAS (compatibles, NO diagnósticos):
- ira_leve: Infección respiratoria aguda leve
- ira_moderada_grave: Infección respiratoria aguda moderada a grave
- asma_posible: Patrón compatible con asma bronquial
- epoc_cronica_posible: Patrón compatible con EPOC
- bajo_riesgo: Sin indicadores preocupantes

PUNTAJE DE RIESGO (0-100):
- 0-30: Bajo riesgo
- 31-60: Riesgo medio
- 61-100: Riesgo alto

Considera factores de riesgo adicionales:
- Adultos mayores tienen mayor riesgo base
- Condiciones previas (asma, EPOC, fibrosis) aumentan el riesgo
- Síntomas severos (dificultad respiratoria severa, fiebre alta) aumentan significativamente el riesgo

Debes responder ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "patron_tos": "string",
  "categoria_clinica": "string",
  "descripcion_categoria": "string explicativa en español",
  "puntaje_riesgo": number,
  "nivel_riesgo": "bajo|medio|alto",
  "mensaje_riesgo": "string corto explicando el riesgo",
  "recomendaciones_preventivas": "string con consejos preventivos",
  "signos_alarma": ["array de strings con signos de alarma"]
}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, audioType, sintomas, perfil } = await req.json() as {
      audio: string;
      audioType: string;
      sintomas: Sintomas;
      perfil: Perfil;
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the user prompt with all context
    const userPrompt = `Analiza los siguientes datos de un paciente y proporciona una evaluación de riesgo respiratorio.

PERFIL DEL PACIENTE:
- Grupo de edad: ${perfil.grupoEdad === 'nino' ? 'Niño (0-12 años)' : perfil.grupoEdad === 'adulto' ? 'Adulto (13-64 años)' : 'Adulto mayor (65+ años)'}
- Condiciones previas: ${perfil.condicionesPrevias.join(', ') || 'Ninguna reportada'}

SÍNTOMAS REPORTADOS:
- Duración de la tos: ${sintomas.duracionTos === 'menos_24h' ? 'Menos de 24 horas' : sintomas.duracionTos === '1_3_dias' ? '1 a 3 días' : 'Más de 3 días'}
- Fiebre: ${sintomas.fiebre ? 'Sí' : 'No'}
- Dificultad para respirar: ${sintomas.dificultadRespirar === 'no' ? 'No' : sintomas.dificultadRespirar === 'leve' ? 'Leve' : sintomas.dificultadRespirar === 'moderada' ? 'Moderada' : 'Severa'}
- Dolor en el pecho: ${sintomas.dolorPecho ? 'Sí' : 'No'}
- Sibilancias/silbidos: ${sintomas.sibilancias ? 'Sí' : 'No'}
- Nivel de energía: ${sintomas.nivelEnergia === 'normal' ? 'Normal' : sintomas.nivelEnergia === 'bajo' ? 'Bajo' : 'Muy bajo'}

Se ha recibido una grabación de audio de la tos del paciente. Basándote en los síntomas reportados y el contexto clínico, determina el patrón de tos más probable y realiza la evaluación de riesgo.

Recuerda: Esta es una herramienta de tamizaje preventivo, NO un diagnóstico médico.`;

    console.log('Calling Lovable AI Gateway for analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Límite de solicitudes excedido. Por favor intenta más tarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Servicio temporalmente no disponible.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    console.log('AI response:', content);

    // Parse the JSON response
    const result = JSON.parse(content);

    // Validate and ensure all required fields
    const validatedResult = {
      patron_tos: result.patron_tos || 'indefinida',
      categoria_clinica: result.categoria_clinica || 'bajo_riesgo',
      descripcion_categoria: result.descripcion_categoria || 'No se pudo determinar una categoría específica.',
      puntaje_riesgo: Math.min(100, Math.max(0, result.puntaje_riesgo || 0)),
      nivel_riesgo: result.nivel_riesgo || 'bajo',
      mensaje_riesgo: result.mensaje_riesgo || 'Evaluación completada.',
      recomendaciones_preventivas: result.recomendaciones_preventivas || 'Mantén hábitos de higiene respiratoria y consulta a un médico si los síntomas persisten.',
      signos_alarma: Array.isArray(result.signos_alarma) ? result.signos_alarma : [
        'Dificultad respiratoria severa',
        'Fiebre alta persistente',
        'Coloración azulada en labios o uñas'
      ],
    };

    return new Response(JSON.stringify(validatedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error en el análisis' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
