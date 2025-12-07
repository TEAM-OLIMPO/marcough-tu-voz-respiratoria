# Clasificador de Tos por Audio

Este proyecto analiza **grabaciones cortas de tos** para identificar posibles afecciones respiratorias de forma **rápida y no invasiva**, utilizando inteligencia artificial.

---

## Explicación en lenguaje natural

1. **Entrada de audio**  
   Grabamos un sonido de tos de aproximadamente 2–3 segundos. Este audio puede ser un archivo `.wav` o `.mp3`.

2. **Transformación del audio a características numéricas (MFCC)**  
   La máquina no entiende directamente los sonidos, así que primero convertimos el audio en números que representen sus frecuencias. Para esto usamos los **coeficientes cepstrales en escala Mel (MFCC)**.  
   - Los MFCC capturan información sobre **cómo cambia la frecuencia de la tos a lo largo del tiempo**, algo que es característico de cada tipo de tos.  
   - Esto convierte cada grabación en un **vector de números** que podemos usar para entrenar un modelo de inteligencia artificial.

3. **Modelo de inteligencia artificial (MLP)**  
   - El vector de MFCC entra a una **red neuronal de varias capas (MLP)**.  
   - Cada capa realiza operaciones matemáticas que combinan y transforman la información para aprender **patrones característicos de tos positiva o negativa**.  
   - Al final, el modelo da una **predicción**: si la tos es indicativa de una posible afección respiratoria o no.

4. **Predicción y confianza**  
   - El modelo devuelve la **clase predicha** y un valor de **confianza** entre 0 y 1, indicando qué tan seguro está el modelo de su predicción.  
   - La métrica que usamos para evaluar el desempeño del modelo es la **accuracy**, es decir, la proporción de predicciones correctas sobre todas las predicciones.

5. **Uso práctico**  
   - Cualquier persona puede grabar un audio de tos y obtener una predicción rápida.  
   - Esto puede servir como una **herramienta preliminar de detección**, aunque no reemplaza un diagnóstico médico profesional.

---


### Métrica

y_test → las etiquetas reales de los audios de prueba (0 o 1).

y_pred → las predicciones del modelo sobre esos mismos audios.

## Flujo resumido en lenguaje natural
Se graba un audio de tos
│
Se convierte el audio en un vector de números (MFCC)
│
El vector entra a una red neuronal (MLP)
│
El modelo analiza el patrón y predice si hay indicios de afección
│
Se obtiene la predicción con un valor de confianza


---

## Preprocesamiento y MFCC

- **Frecuencia de muestreo (SAMPLE_RATE)**: 22050 Hz  
- **Duración fija**: 3 segundos  
- **Filtros Mel (N_MELS)**: 128  
- **Tamaño ventana FFT (N_FFT)**: 2048  
- **Hop length**: 512  

### Proceso matemático simplificado

1. **Señal de audio en tiempo**: \(x[n]\)  
2. **Transformada de Fourier (FFT)**: \(X[k] = \sum_{n=0}^{N-1} x[n] e^{-j 2\pi kn/N}\)  
3. **Filtrado Mel**: \(S[m] = \sum_{k} |X[k]|^2 H_m[k]\)  
4. **Logaritmo**: \(\log S[m]\)  
5. **Transformada Discreta del Coseno (DCT)**: \(MFCC[c] = \sum_m \log S[m] \cos\Big(\frac{\pi c (m+0.5)}{M}\Big)\)

> Los MFCC resultantes son un vector 1D que sirve como entrada para el MLP.

---

## Arquitectura del modelo (MLP)

- **Capa de entrada**: tamaño del vector MFCC (ej. 40×100 = 4000)  
- **Capa oculta 1**: 256 neuronas, activación ReLU + Dropout 0.3  
- **Capa oculta 2**: 128 neuronas, activación ReLU + Dropout 0.3  
- **Capa de salida**: 1 neurona, activación Sigmoid  

### Función matemática

Para una capa densa:  

\[
y = \sigma(Wx + b)
\]

- \(x\) → vector de entrada  
- \(W\) → matriz de pesos  
- \(b\) → bias  
- \(\sigma\) → función de activación (ReLU o Sigmoid)  

**Función de pérdida**: Binary Crossentropy  

\[
L = -\frac{1}{N} \sum_{i=1}^N \big[ y_i \log(\hat{y}_i) + (1-y_i) \log(1-\hat{y}_i) \big]
\]

---

## Predicción de nuevos audios

1. **Carga del modelo y encoder**: se utiliza el Model Loader para no recargar el modelo cada vez.  
2. **Preprocesamiento**: se aplica la misma transformación MFCC que en entrenamiento.  
3. **Predicción**:  
   - `model.predict(input_vector)` devuelve probabilidades  
   - `np.argmax` selecciona la clase con mayor probabilidad  
   - `encoder.inverse_transform` traduce a la etiqueta final  

 se calcula en tu código:

loss, acc = model.evaluate(X_test, y_test)
