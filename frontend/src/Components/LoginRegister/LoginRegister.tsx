import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import './LoginRegister.css';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import {
  type LoginFormData,
  loginSchema,
  type RegisterFormData,
  registerSchema,
} from '../../lib/Auth';
import { authService } from '../../lib/services';

const LoginRegister = () => {
  const [action, setAction] = useState('');

  // Auth mutations
  const loginMutation = authService.useLogin();
  const registerMutation = authService.useRegister();

  // Login form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema as any),
  });

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema as any),
  });

  const registerLink = () => {
    setAction(' active');
  };

  const loginLink = () => {
    setAction('');
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      console.log('Registration successful');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className={`wrapper${action}`}>
      <div className="form-box login">
        <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
          <h1>Login</h1>

          <div className="input-box">
            <input
              {...registerLogin('email')}
              type="email"
              placeholder="Email"
              className={loginErrors.email ? 'error' : ''}
            />
            <FaEnvelope className="icon" />
          </div>
          {loginErrors.email && (
            <div className="error-message">{loginErrors.email.message}</div>
          )}

          <div className="input-box">
            <input
              {...registerLogin('password')}
              type="password"
              placeholder="Password"
              className={loginErrors.password ? 'error' : ''}
            />
            <FaLock className="icon" />
          </div>
          {loginErrors.password && (
            <div className="error-message">{loginErrors.password.message}</div>
          )}

          {/* <div className="remember-forgot">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div> */}

          <button
            type="submit"
            disabled={isLoginSubmitting || loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Login'}
          </button>

          {loginMutation.error && (
            <div className="api-error-message">
              {loginMutation.error.message || 'Login failed. Please try again.'}
            </div>
          )}

          <div className="register-link">
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={registerLink}
              >
                Register
              </button>
            </p>
          </div>
        </form>
      </div>

      <div className="form-box register">
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
          <h1>Registration</h1>

          <div className="input-box">
            <input
              {...registerRegister('name')}
              type="text"
              placeholder="Username"
              className={registerErrors.name ? 'error' : ''}
            />
            <FaUser className="icon" />
          </div>
          {registerErrors.name && (
            <div className="error-message">{registerErrors.name.message}</div>
          )}

          <div className="input-box">
            <input
              {...registerRegister('email')}
              type="email"
              placeholder="Email"
              className={registerErrors.email ? 'error' : ''}
            />
            <FaEnvelope className="icon" />
          </div>
          {registerErrors.email && (
            <div className="error-message">{registerErrors.email.message}</div>
          )}

          <div className="input-box">
            <input
              {...registerRegister('password')}
              type="password"
              placeholder="Password"
              className={registerErrors.password ? 'error' : ''}
            />
            <FaLock className="icon" />
          </div>
          {registerErrors.password && (
            <div className="error-message">
              {registerErrors.password.message}
            </div>
          )}

          <div className="input-box">
            <input
              {...registerRegister('confirmPassword')}
              type="password"
              placeholder="Confirm Password"
              className={registerErrors.confirmPassword ? 'error' : ''}
            />
            <FaLock className="icon" />
          </div>
          {registerErrors.confirmPassword && (
            <div className="error-message">
              {registerErrors.confirmPassword.message}
            </div>
          )}

          <div className="remember-forgot">
            <label>
              <input type="checkbox" />I agree to the terms & conditions
            </label>
          </div>

          <button
            type="submit"
            disabled={isRegisterSubmitting || registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Registering...' : 'Register'}
          </button>

          {registerMutation.error && (
            <div className="api-error-message">
              {registerMutation.error.message ||
                'Registration failed. Please try again.'}
            </div>
          )}

          <div className="register-link">
            <p>
              Already have an account?{' '}
              <button type="button" className="link-button" onClick={loginLink}>
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
