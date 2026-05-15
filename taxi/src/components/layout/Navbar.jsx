import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CarTaxiFront, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link');

  return (
    <div className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand" aria-label="TAXICATOR">
          <span className="nav__brandIcon">
            <CarTaxiFront size={22} />
          </span>
          <span className="nav__brandText">TAXICATOR</span>
        </Link>

        {user ? (
          <>
            <div className="nav__links">
              <NavLink to="/dashboard" className={navClass}>
                Dashboard
              </NavLink>
              <NavLink to="/vehiculos" className={navClass}>
                Mis Vehículos
              </NavLink>
              <NavLink to="/comunidad" className={navClass}>
                Comunidad
              </NavLink>
            </div>

            <div className="nav__right">
              <div className="nav__user">
                <div className="nav__avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.nombre} />
                  ) : (
                    <span>{(user.nombre || 'U').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="nav__userMeta">
                  <div className="nav__userName">{user.nombre}</div>
                  <div className="nav__userRole">{user.rol}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="nav__logout"
              >
                <LogOut size={16} />
                Salir
              </Button>
            </div>
          </>
        ) : (
          <div className="nav__right">
            <NavLink to="/login" className={navClass}>
              Entrar
            </NavLink>
            <NavLink to="/register" className={navClass}>
              Crear cuenta
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

