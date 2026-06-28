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
