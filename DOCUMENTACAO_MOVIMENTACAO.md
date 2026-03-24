# 🛠️ Documentação de Ajuste: Correção de Eixo de Movimentação

## 1. Descrição do Problema
Identificamos que o mapeamento de entrada (input mapping) do personagem **Pedestre** estava incompleto e com inversão de eixos em relação ao plano de visão da câmera.

- **Comportamento Anterior**: 
  - `A`/`D` e `W`/`ArrowUp` todos moviam o personagem apenas para frente (ao longo do eixo X).
  - Não havia suporte para movimento para trás (`S`/`ArrowDown`).
  - Não havia movimento lateral (strafe/esquiva).

- **Comportamento Corrigido**:
  - `W` / `ArrowUp`: Avança (Positivo X).
  - `S` / `ArrowDown`: Recua (Negativo X).
  - `A` / `ArrowLeft`: Desvia para a Esquerda (Positivo Z).
  - `D` / `ArrowRight`: Desvia para a Direita (Negativo Z).

## 2. Localização do Código
O arquivo que requereu alteração foi:
`js/scenes/pedestrian.js`

## 3. Instruções para Correção
Para desverter e padronizar a movimentação, o script `pedestrian.js` foi alterado na função `update(deltaTime)` para ler as entradas e aplicar os multiplicadores correspondentes ao plano de visão da cena (onde a câmera olha para o eixo X positivo).

```javascript
// FORWARD / BACKWARD
if (this.keys['ArrowUp'] || this.keys['KeyW']) {
    this.camera.position.x += this.speed * deltaTime;
} else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
    this.camera.position.x -= this.speed * deltaTime;
}

// LEFT / RIGHT (Strafe)
if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
    this.camera.position.z += this.speed * deltaTime; // Left is +Z
} else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
    this.camera.position.z -= this.speed * deltaTime; // Right is -Z
}
```

## 4. Testes de Verificação
Após aplicar a modificação, o desenvolvedor deve validar os seguintes cenários:
- **Pedestre**: O personagem deve caminhar na direção da travessia (frente) ao apertar `W`, recuar ao apertar `S`, e desviar de carros com `A` e `D`.
