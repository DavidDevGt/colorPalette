export const styles = `
:host {
  display: block;
  font-family: 'Inter', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #0F172A;
  color: #E2E8F0;
  --primary-color: #4a6cf7;
  --primary-hover: #3451c6;
  --text-color: #e0e0e0;
  --dark-bg: #121212;
  --card-bg: #1e1e1e;
  --shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.container {
  text-align: center;
  padding: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #4F46E5;
}

.header p {
  font-size: 1.2rem;
  color: #94A3B8;
}

.palette-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

button {
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.generate-btn {
  background-color: #4F46E5;
  color: white;
  border: none;
  margin-right: 1rem;
}

.export-btn {
  background-color: #475569;
  color: white;
  border: none;
}

.export-container {
  position: relative;
  display: inline-block;
  z-index: 2000;
}

.export-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0;
  padding: 0.2rem 0;
  background-color: var(--card-bg);
  border: 1px solid #333;
  border-radius: 4px;
  box-shadow: var(--shadow);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
  z-index: 3000;
}

.export-container:hover .export-dropdown,
.export-dropdown:hover {
  opacity: 1;
  visibility: visible;
}

.export-option {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  text-align: left;
  width: 100%;
  color: var(--text-color);
  cursor: pointer;
  transition: background 0.2s;
}

.export-option:hover {
  background-color: var(--primary-hover);
}

button:hover {
  transform: scale(1.05);
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

.color-block {
  flex: 1;
  min-width: 150px;
  height: 200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease;
  background-color: var(--card-bg);
}

.color-block:hover {
  transform: translateY(-5px);
}

.color-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.lock-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.lock-icon:hover {
  background-color: rgba(255, 255, 255, 0.4);
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
  font-size: 0.8rem;
  color: #bbb;
  font-family: monospace;
  cursor: pointer;
}

@media (max-width: 768px) {
  .palette-container {
    flex-direction: column;
  }

  .color-block {
    min-width: 100%;
  }

  .controls {
    flex-direction: column;
    align-items: center;
  }

  button {
    width: 100%;
    max-width: 300px;
  }
}

`;
