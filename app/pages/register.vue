<script setup lang="ts">
import { useAuth, type RegisterPayload } from '~/composables/useAuth'

definePageMeta({
  middleware: 'guest'
})

const { register, loading, error: authError } = useAuth()

const form = reactive({
  firstName: '',
  lastName: '',
  documentType: 'CC',
  documentNumber: '',
  age: null as number | null,
  email: '',
  phone: '',
  acceptedTerms: false,
  password: ''
})

const validationError = ref<string | null>(null)

const documentTypes = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'PAS', label: 'Pasaporte (PAS)' },
  { value: 'PEP', label: 'Permiso Especial de Permanencia (PEP)' }
]

const handleRegister = async () => {
  validationError.value = null

  if (!form.acceptedTerms) {
    validationError.value = 'Debes aceptar los términos y condiciones para continuar.'
    return
  }

  if (!form.age || form.age < 1 || form.age > 120) {
    validationError.value = 'Por favor ingresa una edad válida (entre 1 y 120 años).'
    return
  }

  const payload: RegisterPayload = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    documentType: form.documentType,
    documentNumber: form.documentNumber.trim(),
    age: form.age,
    email: form.email.trim(),
    phone: form.phone.trim(),
    acceptedTerms: form.acceptedTerms,
    password: form.password
  }

  await register(payload)
}
</script>

<template>
  <div class="register-wrapper">
    <!-- Glowing background decorative spheres -->
    <div class="glow-sphere glow-1"></div>
    <div class="glow-sphere glow-2"></div>

    <div class="register-card">
      <div class="card-header">
        <div class="logo-badge">
          <i class="pi pi-user-plus" style="font-size: 1.75rem;"></i>
        </div>
        <h1>Crear Cuenta</h1>
        <p>Completa tus datos para registrarte en la plataforma</p>
      </div>

      <!-- PrimeVue Message on Error -->
      <Message v-if="authError || validationError" severity="error" :closable="false" class="error-alert">
        {{ validationError || authError }}
      </Message>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Fila: Nombres y Apellidos -->
        <div class="form-row">
          <div class="form-field">
            <label for="firstName">Nombre</label>
            <InputText
              id="firstName"
              v-model="form.firstName"
              placeholder="Mario"
              required
              :disabled="loading"
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="lastName">Apellido</label>
            <InputText
              id="lastName"
              v-model="form.lastName"
              placeholder="Jaramillo"
              required
              :disabled="loading"
              class="w-full"
            />
          </div>
        </div>

        <!-- Fila: Tipo y Número de Documento -->
        <div class="form-row">
          <div class="form-field">
            <label for="documentType">Tipo de Documento</label>
            <Select
              id="documentType"
              v-model="form.documentType"
              :options="documentTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione un tipo"
              :disabled="loading"
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="documentNumber">Número de Documento</label>
            <InputText
              id="documentNumber"
              v-model="form.documentNumber"
              placeholder="1128451610"
              required
              :disabled="loading"
              class="w-full"
            />
          </div>
        </div>

        <!-- Fila: Edad y Teléfono -->
        <div class="form-row">
          <div class="form-field">
            <label for="age">Edad</label>
            <InputNumber
              id="age"
              v-model="form.age"
              :min="1"
              :max="120"
              placeholder="37"
              required
              :disabled="loading"
              class="w-full"
              inputClass="w-full"
            />
          </div>

          <div class="form-field">
            <label for="phone">Teléfono / Celular</label>
            <div class="input-with-icon">
              <i class="pi pi-phone input-icon"></i>
              <InputText
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="+573015363448"
                required
                :disabled="loading"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Fila: Correo Electrónico -->
        <div class="form-field">
          <label for="email">Correo Electrónico</label>
          <div class="input-with-icon">
            <i class="pi pi-envelope input-icon"></i>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              placeholder="mario.test2026@gmail.com"
              required
              :disabled="loading"
              class="w-full"
            />
          </div>
        </div>

        <!-- Fila: Contraseña -->
        <div class="form-field">
          <label for="password">Contraseña</label>
          <div class="input-with-icon">
            <i class="pi pi-lock input-icon"></i>
            <Password
              id="password"
              v-model="form.password"
              :feedback="false"
              toggleMask
              placeholder="••••••••"
              required
              :disabled="loading"
              class="w-full"
              inputClass="w-full"
            />
          </div>
        </div>

        <!-- Términos y Condiciones -->
        <div class="terms-group">
          <Checkbox
            v-model="form.acceptedTerms"
            :binary="true"
            inputId="acceptedTerms"
            :disabled="loading"
          />
          <label for="acceptedTerms" class="terms-text">
            Acepto los <a href="#" class="terms-link">Términos y Condiciones</a> y la Política de Tratamiento de Datos.
          </label>
        </div>

        <!-- Botón de Envío -->
        <Button
          type="submit"
          label="Crear Cuenta"
          icon="pi pi-user-plus"
          :loading="loading"
          class="w-full submit-btn"
        />

        <!-- Enlace a Login -->
        <div class="login-footer">
          <span>¿Ya tienes una cuenta?</span>
          <NuxtLink to="/login" class="login-link">Inicia sesión</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.register-wrapper {
  min-height: 100vh;
  @include flex-center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
  background-color: $bg-app;

  .glow-1 {
    @include glow-sphere($color-primary-500, $color-accent-blue, 420px);
    top: -100px;
    left: -100px;
  }

  .glow-2 {
    @include glow-sphere($color-accent-purple, $color-accent-pink, 450px);
    bottom: -120px;
    right: -120px;
  }
}

.register-card {
  @include glass-card;
  width: 100%;
  max-width: 580px;
  padding: 2.5rem 2.2rem;
  z-index: 10;
  animation: fadeIn 0.4s ease-out;
}

.card-header {
  text-align: center;
  margin-bottom: 1.75rem;

  .logo-badge {
    display: inline-flex;
    @include flex-center;
    width: 54px;
    height: 54px;
    border-radius: $radius-lg;
    background: linear-gradient(135deg, $color-primary-500, $color-accent-purple);
    color: $text-primary;
    margin-bottom: 1rem;
    box-shadow: $shadow-glow-primary;
  }

  h1 {
    font-size: 1.65rem;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 0.4rem 0;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 0.88rem;
    color: $text-muted;
    margin: 0;
  }
}

.error-alert {
  margin-bottom: 1.25rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @include responsive-sm {
    grid-template-columns: 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;

  label {
    font-size: 0.85rem;
    font-weight: 500;
    color: $text-secondary;
  }
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;

  .input-icon {
    position: absolute;
    left: 14px;
    color: $text-muted;
    z-index: 2;
    pointer-events: none;
  }

  :deep(.p-inputtext),
  :deep(.p-password-input) {
    padding-left: 2.75rem !important;
  }
}

.terms-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0.25rem 0;
  cursor: pointer;

  .terms-text {
    font-size: 0.84rem;
    color: $text-secondary;
    line-height: 1.4;
    cursor: pointer;
  }

  .terms-link {
    color: $color-primary-400;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: $color-primary-100;
      text-decoration: underline;
    }
  }
}

.submit-btn {
  margin-top: 0.5rem;
  padding: 0.85rem 1.25rem;
}

.login-footer {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.88rem;
  color: $text-muted;
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  align-items: center;

  .login-link {
    color: $color-primary-400;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $color-primary-100;
      text-decoration: underline;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
