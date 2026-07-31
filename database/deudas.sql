-- Ejecutar en MySQL Workbench sobre la base de datos existente gestion_taxi
-- Proyecto: Gestión Pagos Taxi — Deudas de conductores

USE gestion_taxi;

-- Deuda global por conductor en cada vehículo
-- El propietario registra deudas adicionales fuera del producido del calendario
CREATE TABLE IF NOT EXISTS deudas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT NOT NULL,
  conductor_id INT NOT NULL,
  propietario_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (conductor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (propietario_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Abonos realizados a una deuda: el propietario o el conductor pueden abonar
CREATE TABLE IF NOT EXISTS abonos_deuda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deuda_id INT NOT NULL,
  usuario_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  comentario TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deuda_id) REFERENCES deudas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;