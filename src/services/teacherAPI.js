import apiClient from './api';
import { normalizeTeacher } from '../utils/teacherUtils';

const teacherAPI = {
  async getAllTeachers({ fresh = false } = {}) {
    const list = fresh
      ? await apiClient.getTeachersFresh()
      : await apiClient.getTeachers();
    return list.map(normalizeTeacher).filter(Boolean);
  },

  async saveAllTeachers(teachers) {
    await apiClient.saveTeachersData(teachers);
    return teachers;
  },

  async updateTeacherPassword(email, newPassword) {
    const emailKey = email?.trim().toLowerCase();
    if (!emailKey) {
      throw new Error('Email không hợp lệ');
    }

    const teachers = await this.getAllTeachers({ fresh: true });
    const index = teachers.findIndex((t) => t.email?.trim().toLowerCase() === emailKey);
    if (index === -1) {
      throw new Error('Không tìm thấy tài khoản giáo viên');
    }

    const updated = teachers.map((t, i) =>
      i === index ? { ...t, password: newPassword } : t
    );
    await this.saveAllTeachers(updated);
    return updated[index];
  },
};

export default teacherAPI;
