import { useEffect, useMemo, useState } from 'react';
import GVLayout from '../layouts/GVLayout';
import teacherAPI from '../services/teacherAPI';
import studentAPI from '../services/studentAPI';
import {
  fetchOpenRegistrations,
  fetchStudentRegistrations,
  OPEN_REGISTRATIONS_UPDATED_EVENT,
  STUDENT_REGISTRATIONS_UPDATED_EVENT,
} from '../utils/registrationUtils';

export default function TeacherClassList() {
  const [openRegs, setOpenRegs] = useState([]);
  const [studentRegs, setStudentRegs] = useState([]);
  const [students, setStudents] = useState([]);
  const [myTeacherId, setMyTeacherId] = useState(null);
  const [selectedRegId, setSelectedRegId] = useState('');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(sessionStorage.getItem('currentUser')) || {};
        const teachers = await teacherAPI.getAllTeachers({ fresh: true });
        const teacher = teachers.find((t) => t.email?.toLowerCase() === user.email?.toLowerCase());
        setMyTeacherId(teacher?.id ?? null);

        const [regs, enrollments, studs] = await Promise.all([
          fetchOpenRegistrations({ fresh: true }),
          fetchStudentRegistrations({ fresh: true }),
          studentAPI.getAllStudents({ fresh: true }),
        ]);

        setOpenRegs(regs);
        setStudentRegs(enrollments);
        setStudents(studs);
      } catch (e) {
        console.error(e);
        showToast('Không tải được dữ liệu từ API', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();

    const onOpenUpdate = () => fetchOpenRegistrations({ fresh: true }).then(setOpenRegs).catch(() => {});
    const onStudentUpdate = () => fetchStudentRegistrations({ fresh: true }).then(setStudentRegs).catch(() => {});

    window.addEventListener(OPEN_REGISTRATIONS_UPDATED_EVENT, onOpenUpdate);
    window.addEventListener(STUDENT_REGISTRATIONS_UPDATED_EVENT, onStudentUpdate);
    return () => {
      window.removeEventListener(OPEN_REGISTRATIONS_UPDATED_EVENT, onOpenUpdate);
      window.removeEventListener(STUDENT_REGISTRATIONS_UPDATED_EVENT, onStudentUpdate);
    };
  }, []);

  const myClasses = useMemo(() => {
    if (myTeacherId == null) return [];
    return openRegs.filter((r) => String(r.teacherId) === String(myTeacherId));
  }, [openRegs, myTeacherId]);

  const enrolledList = useMemo(() => {
    if (!selectedRegId) return [];
    const enrolls = studentRegs.filter((e) => String(e.regId) === String(selectedRegId));
    return enrolls
      .map((en) => ({ enrollment: en, student: students.find((s) => String(s.id) === String(en.studentId)) }))
      .filter((it) => it.student);
  }, [selectedRegId, studentRegs, students]);

  const total = enrolledList.length;

  function handleSelect(e) {
    setSelectedRegId(e.target.value);
  }

  function showToast(message, type = 'error') {
    setToasts((prev) => [...prev, { id: Date.now().toString(), message, type }]);
  }

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3000));
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <GVLayout>
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Quản lý lớp học</h2>
              <p className="text-xs text-gray-500">Xem danh sách sinh viên đăng ký</p>
            </div>
            <div className="w-full md:w-80">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Chọn học phần giảng dạy</label>
              <select value={selectedRegId} onChange={handleSelect} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer">
                <option value="">-- Chọn học phần --</option>
                {myClasses.map((c) => (
                  <option key={c.id} value={c.id}>{`${c.courseId} - ${c.courseName}`}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedRegId ? (
            <div>
              <div className="flex items-center justify-between mb-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <i className="fas fa-users text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Tổng số sinh viên</p>
                    <p className="text-xl font-bold text-indigo-900">{total}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left custom-table">
                  <thead>
                    <tr>
                      <th className="p-4 text-center w-16">STT</th>
                      <th className="p-4">Mã sinh viên</th>
                      <th className="p-4">Họ và tên</th>
                      <th className="p-4">Giới tính</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Khoa</th>
                      <th className="p-4">Ngày sinh</th>
                      <th className="p-4 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                    {enrolledList.map((item, idx) => {
                      const s = item.student;
                      const formattedId = `SV-${String(s.id).padStart(3, '0')}`;
                      return (
                        <tr key={s.id} className="hover:bg-gray-50 transition border-b border-gray-50">
                          <td className="p-4 text-center font-medium text-gray-400">{idx + 1}</td>
                          <td className="p-4 font-bold text-indigo-600">{formattedId}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}`} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                              <span className="font-bold text-gray-700">{s.name}</span>
                            </div>
                          </td>
                          <td className="p-4">{s.gender || 'Nam'}</td>
                          <td className="p-4 text-gray-600">{s.email || 'N/A'}</td>
                          <td className="p-4 text-gray-600">{s.department || 'N/A'}</td>
                          <td className="p-4 text-gray-500">{s.dob || ''}</td>
                          <td className="p-4 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-600">Đang học</span>
                          </td>
                        </tr>
                      );
                    })}
                    {enrolledList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400">Không có sinh viên đăng ký cho học phần này.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center" id="emptyState">
              <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" className="w-24 h-24 mx-auto mb-4 opacity-20 grayscale" alt="empty" />
              <p className="text-gray-400 font-medium">Vui lòng chọn một học phần để hiển thị dữ liệu</p>
            </div>
          )}
        </div>

        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
          {toasts.map((t) => (
            <div key={t.id} className={`${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3`}>
              <i className={`fas ${t.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`} />
              <span className="font-bold text-sm">{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    </GVLayout>
  );
}
