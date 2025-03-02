export const styles = `
:host {
  display: block;
  font-family: 'Inter', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #0F172A;
  color: #E2E8F0;
  --primary-color: #4F46E5;
  --primary-hover: #4338CA;
  --text-color: #E2E8F0;
  --dark-bg: #121212;
  --card-bg: #1E293B;
  --shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.container {
  text-align: center;
  padding: 2rem 1rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.header p {
  font-size: 1.1rem;
  color: #94A3B8;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.generate-btn {
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  color: #fff;
  position: relative;
  overflow: hidden;
}

.generate-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.15), transparent 40%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.generate-btn:hover {
  transform: translateY(-1px);
}

.generate-btn:hover::after {
  opacity: 0.5;
}

.generate-btn.disappear {
  display: none !important;
}

.export-container {
  position: relative;
  display: inline-block;
}

.export-btn {
  background-color: #475569;
  color: #fff;
}

.export-btn:disabled {
  background-color: #3b3f45;
  cursor: not-allowed;
}

.export-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.4rem;
  padding: 0.4rem 0;
  background-color: var(--card-bg);
  border: 1px solid #2f3542;
  border-radius: 6px;
  box-shadow: var(--shadow);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 3000;
  min-width: 120px;
}

.export-container:hover .export-dropdown {
  opacity: 1;
  visibility: visible;
}

.export-option {
  background: none;
  border: none;
  padding: 0.6rem 1rem;
  text-align: left;
  width: 100%;
  color: var(--text-color);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.export-option:hover {
  background-color: var(--primary-hover);
  color: #fff;
}

/* Contenedor de la paleta */
.palette-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding: 0 1rem;
}

.copy-notice {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #10B981;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  z-index: 1000;
}

.copy-notice.active {
  opacity: 1;
}

/* ----- Color Blocks ----- */

.color-block {
  flex: 1;
  min-width: 150px;
  height: 200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow);
  background-color: var(--card-bg);
  border-radius: 6px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.color-block:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6);
}

.color-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

/* Icono de candado */
.lock-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.lock-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.lock-icon svg {
  width: 16px;
  height: 16px;
  stroke: #e0e0e0;
}

.color-info {
  background-color: var(--card-bg);
  padding: 1rem;
  text-align: center;
}

.hex-code {
  font-weight: bold;
  font-family: monospace;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  color: var(--text-color);
}

.rgb-code,
.hsl-code {
  font-size: 0.85rem;
  color: #bbb;
  font-family: monospace;
  cursor: pointer;
}

/* ----- Responsive ----- */

@media (max-width: 768px) {
  .palette-container {
    flex-direction: column;
  }

  .color-block {
    min-width: 100%;
  }

  .controls {
    flex-direction: column;
    gap: 0.8rem;
  }

  button {
    width: 100%;
    max-width: 300px;
  }
}

.preview-container {
  position: absolute;
  top: 100%;
  left: 8.5rem;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 1.2rem;
  min-width: 300px;
  max-width: 400px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
  z-index: 20000;
  margin-top: 5px;
}

.preview-container.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.preview-container h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1rem;
  color: rgba(226, 232, 240, 0.95);
  border-bottom: 1px solid rgba(71, 85, 105, 0.5);
  padding-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.preview-content {
  background: rgba(15, 23, 42, 0.6);
  padding: 14px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.9);
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.preview-content::-webkit-scrollbar {
  width: 6px;
}

.preview-content::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.2);
  border-radius: 3px;
}

.preview-content::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.6);
  border-radius: 3px;
}

.export-dropdown {
  z-index: 30;
}
`;
