import { TeacherFormData } from '../types';

export async function fetchTeachersFromDb(token?: string | null): Promise<TeacherFormData[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/teachers', { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch teachers: ${res.statusText}`);
  }
  return await res.json();
}

export async function saveTeacherToDb(
  teacher: TeacherFormData,
  token?: string | null
): Promise<TeacherFormData> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/teachers', {
    method: 'POST',
    headers,
    body: JSON.stringify(teacher),
  });

  if (!res.ok) {
    throw new Error(`Failed to save teacher: ${res.statusText}`);
  }
  return await res.json();
}

export async function deleteTeacherFromDb(
  id: string,
  token?: string | null
): Promise<void> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api/teachers/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to delete teacher: ${res.statusText}`);
  }
}
