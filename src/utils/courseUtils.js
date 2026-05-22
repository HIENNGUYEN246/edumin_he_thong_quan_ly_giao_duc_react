import courseAPI from '../services/courseAPI';

export function dedupeCoursesById(courses) {
  const map = new Map();
  for (const course of courses || []) {
    const key = course?.id?.trim().toUpperCase();
    if (key) map.set(key, course);
  }
  return [...map.values()];
}

/** Đồng bộ deptId/dept theo danh sách khoa từ API */
export function syncCoursesWithDepartments(courses, departments) {
  if (!Array.isArray(courses) || !Array.isArray(departments)) return courses;
  return courses.map((course) => {
    const foundDept =
      departments.find((d) => d.id === course.deptId) ||
      departments.find((d) => d.name === course.dept);
    if (!foundDept) return course;
    if (course.deptId === foundDept.id && course.dept === foundDept.name) return course;
    return { ...course, deptId: foundDept.id, dept: foundDept.name };
  });
}

/** Tải học phần từ API (đã gộp & khử trùng) */
export async function fetchCourses({ fresh = false } = {}) {
  const list = await courseAPI.getAllCourses({ fresh });
  return dedupeCoursesById(Array.isArray(list) ? list : []);
}

/** Lưu học phần lên API và trả về bản ghi sau khi lưu */
export async function saveCourses(courses) {
  const payload = dedupeCoursesById(courses);
  await courseAPI.saveAllCourses(payload);
  return payload;
}

export async function fetchCoursesByDepartment(deptName) {
  const courses = await fetchCourses({ fresh: true });
  return courses.filter((c) => c.dept === deptName || c.deptId === deptName);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}
