/* ------------------------------------------------------------------ */
/* Employees                                                           */
/* ------------------------------------------------------------------ */

export interface Employee {
  id: number;
  firstName: string;
  secondName?: string | null;
  lastName: string;
  surName?: string | null;
  nationalId?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  birthDate?: string | null;
  hireDate?: string | null;
  salary?: number | null;
}

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

export interface Permission {
  id: number;
  name: string;
}

/* ------------------------------------------------------------------ */
/* Roles                                                              */
/* ------------------------------------------------------------------ */

export interface Role {
  id: number;
  name: string;
  /** Serializado como objetos completos {id,name} en la lista y en GET /roles/:id. */
  permissions?: Permission[];
}

/* ------------------------------------------------------------------ */
/* Users                                                              */
/* ------------------------------------------------------------------ */

/**
 * Usuario de acceso al sistema. El backend NUNCA devuelve `password`, y NO
 * serializa el objeto `employee` en los endpoints /users — solo el escalar
 * `employeeId` (el objeto empleado solo llega vía /auth/me). En cambio, `roles`
 * SÍ viene como `Role[]` completo en la lista y en GET /users/:id.
 */
export interface User {
  id: number;
  username: string;
  employeeId: number;
  roles?: Role[];
}
