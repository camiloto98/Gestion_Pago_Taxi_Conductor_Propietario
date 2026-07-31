-- Ejecutar en MySQL Workbench
-- Proyecto: Gestión Pagos Taxi

CREATE DATABASE IF NOT EXISTS gestion_taxi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_taxi;

-- Usuarios (conductores y propietarios)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('conductor','propietario') NOT NULL,
  avatar_url VARCHAR(255),
  telefono VARCHAR(20),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vehículos registrados por propietarios
CREATE TABLE vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  propietario_id INT NOT NULL,
  placa VARCHAR(20) UNIQUE NOT NULL,
  marca VARCHAR(80),
  modelo VARCHAR(80),
  año INT,
  color VARCHAR(40),
  foto_url VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (propietario_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tokens de acceso: propietario genera → conductor usa
CREATE TABLE tokens_acceso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT NOT NULL,
  propietario_id INT NOT NULL,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  conductor_id INT DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE,
  FOREIGN KEY (propietario_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (conductor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pagos diarios con imagen (calendario)
CREATE TABLE pagos_diarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conductor_id INT NOT NULL,
  vehiculo_id INT NOT NULL,
  fecha DATE NOT NULL,
  imagen_url VARCHAR(255) NOT NULL,
  estado ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  subido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unico_pago_dia (conductor_id, vehiculo_id, fecha),
  FOREIGN KEY (conductor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Comentarios del propietario sobre un pago
CREATE TABLE comentarios_pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pago_id INT NOT NULL,
  propietario_id INT NOT NULL,
  texto TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pago_id) REFERENCES pagos_diarios(id) ON DELETE CASCADE,
  FOREIGN KEY (propietario_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Feed social (publicaciones tipo Facebook)
CREATE TABLE publicaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  autor_id INT NOT NULL,
  tipo ENUM('retén','paro','alerta','general') DEFAULT 'general',
  titulo VARCHAR(200),
  contenido TEXT NOT NULL,
  imagen_url VARCHAR(255),
  likes INT DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Comentarios en publicaciones del feed
CREATE TABLE comentarios_feed (
  id INT AUTO_INCREMENT PRIMARY KEY,
  publicacion_id INT NOT NULL,
  autor_id INT NOT NULL,
  texto TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (autor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Likes en publicaciones
CREATE TABLE likes_publicaciones (
  user_id INT NOT NULL,
  publicacion_id INT NOT NULL,
  PRIMARY KEY (user_id, publicacion_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Deuda global por conductor en cada vehículo
-- El propietario registra deudas adicionales fuera del producido del calendario
CREATE TABLE deudas (
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
CREATE TABLE abonos_deuda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deuda_id INT NOT NULL,
  usuario_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  comentario TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (deuda_id) REFERENCES deudas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

