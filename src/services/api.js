// API Service - Quản lý tất cả API calls
const API_URL = 'https://mindx-mockup-server.vercel.app/api/resources/edumin_api';
const API_KEY = '69ff56dffe59a9ca0baa44ea';

export function getDefaultAuthData() {
  return {
    users: [
      {
        email: 'admin1@edu.vn',
        pass: '123456',
        role: 'dao-tao',
        hoTen: 'Nguyễn Thế Hiển',
      },
      {
        email: 'admin2@edu.vn',
        pass: 'admin888',
        role: 'dao-tao',
        hoTen: 'Quân',
      },
    ],
    teachersData: [],
    studentsData: [
      {
        id: 1,
        email: 'sinhvien@edumin.edu.vn',
        password: 'sv123456',
        hoTen: 'Lê Văn Sinh Viên',
        status: 'Active',
      },
    ],
    departmentsData: [
      { id: 'CNTT', name: 'Công nghệ thông tin', head: '' },
      { id: 'KT', name: 'Kinh tế', head: '' },
      { id: 'NN', name: 'Ngoại ngữ', head: '' },
    ],
  };
}

class APIClient {
  constructor() {
    this.baseURL = API_URL;
    this.apiKey = API_KEY;
    this.resourceName = 'edumin_api';
  }

  buildUrl(recordId = null) {
    const suffix = recordId ? `/${recordId}` : '';
    return `${this.baseURL}${suffix}?apiKey=${this.apiKey}`;
  }

  /**
   * Gộp mọi trường học phần cũ trên API, khử trùng theo mã HP.
   * Chỉ ghi subjectsData khi lưu; xóa courseList/classesData/coursesData tránh trùng.
   */
  pickCourseList(source) {
    if (!source) return [];
    return this.mergeCoursesById([
      source.subjectsData,
      source.courseList,
      source.classesData,
      source.coursesData,
    ]);
  }

  buildCoursesPayload(authData, courses) {
    return {
      ...this.normalizeAuthPayload(authData),
      subjectsData: courses,
      courseList: [],
      classesData: [],
      coursesData: [],
    };
  }

  pickOpenRegistrations(source) {
    if (!source) return [];
    return source.openRegistrationsData ?? source.openRegistrations ?? [];
  }

  pickStudentRegistrations(source) {
    if (!source) return [];
    return source.studentRegistrationsData ?? source.studentRegistrations ?? [];
  }

  pickAssignmentsData(source) {
    if (!source) return [];
    return source.assignmentsData ?? [];
  }

  mergeOpenRegistrationsById(lists) {
    const map = new Map();
    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      for (const reg of list) {
        if (reg?.id != null) map.set(reg.id, reg);
      }
    }
    return [...map.values()];
  }

  mergeStudentRegistrations(lists) {
    const map = new Map();
    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      for (const enrollment of list) {
        const key = `${enrollment?.studentId}-${enrollment?.regId}`;
        if (enrollment?.studentId != null && enrollment?.regId != null) {
          map.set(key, enrollment);
        }
      }
    }
    return [...map.values()];
  }

  mergeAssignmentsById(lists) {
    const map = new Map();
    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        if (item?.id != null) map.set(item.id, item);
      }
    }
    return [...map.values()];
  }

  mergeStudentRegistrations(lists) {
    const map = new Map();
    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      for (const enrollment of list) {
        const key = `${enrollment?.studentId}-${enrollment?.regId}`;
        if (enrollment?.studentId != null && enrollment?.regId != null) {
          map.set(key, enrollment);
        }
      }
    }
    return [...map.values()];
  }

  normalizeAuthPayload(payload) {
    const courses = this.pickCourseList(payload);
    return {
      users: payload?.users || [],
      teachersData: payload?.teachersData || [],
      studentsData: payload?.studentsData || [],
      departmentsData: payload?.departmentsData || [],
      subjectsData: courses,
      openRegistrationsData: this.pickOpenRegistrations(payload),
      studentRegistrationsData: this.pickStudentRegistrations(payload),
      assignmentsData: this.pickAssignmentsData(payload),
      documentsData: payload?.documentsData || [],
      courseList: [],
      classesData: [],
      coursesData: [],
      openRegistrations: [],
      studentRegistrations: [],
      assignments: [],
      documents: [],
    };
  }

  mergeAccountsByEmail(accountLists) {
    const map = new Map();
    for (const list of accountLists) {
      if (!Array.isArray(list)) continue;
      for (const account of list) {
        const key = account?.email?.trim().toLowerCase();
        if (key) map.set(key, account);
      }
    }
    return [...map.values()];
  }

  extractRecords(response) {
    if (
      response?.users ||
      response?.teachersData ||
      response?.studentsData ||
      response?.departmentsData ||
      response?.subjectsData ||
      response?.courseList ||
      response?.coursesData ||
      response?.openRegistrationsData ||
      response?.openRegistrations ||
      response?.studentRegistrationsData ||
      response?.studentRegistrations
    ) {
      return [response];
    }

    const resource = response?.data ?? response;
    const raw = resource?.data;

    if (raw && !Array.isArray(raw) && typeof raw === 'object') {
      return [raw];
    }

    return Array.isArray(raw) ? raw : [];
  }

  scoreRecord(record) {
    return (
      (record?.users?.length || 0) +
      (record?.teachersData?.length || 0) +
      (record?.studentsData?.length || 0) +
      (record?.departmentsData?.length || 0) +
      this.pickCourseList(record).length +
      this.pickOpenRegistrations(record).length +
      this.pickStudentRegistrations(record).length +
      this.pickAssignmentsData(record).length
    );
  }

  mergeCoursesById(courseLists) {
    const map = new Map();
    for (const list of courseLists) {
      if (!Array.isArray(list)) continue;
      for (const course of list) {
        const key = course?.id?.trim().toUpperCase();
        if (key) map.set(key, course);
      }
    }
    return [...map.values()];
  }

  mergeDepartmentsById(departmentLists) {
    const map = new Map();
    for (const list of departmentLists) {
      if (!Array.isArray(list)) continue;
      for (const dept of list) {
        const key = dept?.id?.trim().toUpperCase();
        if (key) map.set(key, dept);
      }
    }
    return [...map.values()];
  }

  mergeDocumentsById(documentLists) {
    const map = new Map();
    for (const list of documentLists) {
      if (!Array.isArray(list)) continue;
      for (const doc of list) {
        if (!doc?.id) continue;
        map.set(doc.id, doc);
      }
    }
    return [...map.values()];
  }

  // Gộp mọi document trong API (tránh chỉ lấy bản mới thiếu admin)
  mergeRecords(records) {
    if (!records.length) {
      return {
        authData: this.normalizeAuthPayload(null),
        recordId: null,
      };
    }

    if (records.length === 1) {
      return {
        authData: this.normalizeAuthPayload(records[0]),
        recordId: records[0]._id || null,
      };
    }

    const authData = {
      users: this.mergeAccountsByEmail(records.map((r) => r.users)),
      teachersData: this.mergeAccountsByEmail(records.map((r) => r.teachersData)),
      studentsData: this.mergeAccountsByEmail(records.map((r) => r.studentsData)),
      departmentsData: this.mergeDepartmentsById(records.map((r) => r.departmentsData)),
      subjectsData: this.mergeCoursesById(records.map((r) => this.pickCourseList(r))),
      openRegistrationsData: this.mergeOpenRegistrationsById(
        records.map((r) => this.pickOpenRegistrations(r))
      ),
      studentRegistrationsData: this.mergeStudentRegistrations(
        records.map((r) => this.pickStudentRegistrations(r))
      ),
      assignmentsData: this.mergeAssignmentsById(records.map((r) => this.pickAssignmentsData(r))),
      documentsData: this.mergeDocumentsById(records.map((r) => r.documentsData || [])),
    };

    const canonical = records.reduce((best, current) =>
      this.scoreRecord(current) > this.scoreRecord(best) ? current : best
    );

    return {
      authData,
      recordId: canonical._id || null,
    };
  }

  parseAuthDataWithMeta(response) {
    return this.mergeRecords(this.extractRecords(response));
  }

  enrichAuthDataFromDefaults(authData) {
    const defaults = getDefaultAuthData();
    const mapByEmail = (list) =>
      new Map(list.map((item) => [item.email?.trim().toLowerCase(), item]));

    const defaultUsers = mapByEmail(defaults.users);
    const defaultTeachers = mapByEmail(defaults.teachersData);
    const defaultStudents = mapByEmail(defaults.studentsData);

    const mergeList = (items, defaultMap) =>
      items.map((item) => {
        const key = item.email?.trim().toLowerCase();
        const fallback = defaultMap.get(key);
        if (!fallback) return item;
        return {
          ...fallback,
          ...item,
          hoTen: fallback.hoTen,
          role: item.role || fallback.role,
          pass: item.pass ?? fallback.pass,
          password: item.password ?? fallback.password,
        };
      });

    return {
      ...authData,
      users: mergeList(authData.users || [], defaultUsers),
      teachersData: mergeList(authData.teachersData || [], defaultTeachers),
      studentsData: mergeList(authData.studentsData || [], defaultStudents),
    };
  }

  async fetchWithKey() {
    try {
      const response = await fetch(this.buildUrl());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from API:', error);
      throw error;
    }
  }

  async createAuthRecord(authData) {
    const response = await fetch(this.buildUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.normalizeAuthPayload(authData)),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  async updateAuthRecord(recordId, authData) {
    const response = await fetch(this.buildUrl(recordId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.normalizeAuthPayload(authData)),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteAuthRecord(recordId) {
    const response = await fetch(this.buildUrl(recordId), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Gộp dữ liệu vào 1 document, xóa các bản trùng trên API
  async consolidateAuthStorage(records, authData, canonicalRecordId) {
    const payload = this.normalizeAuthPayload(authData);
    let recordId = canonicalRecordId;

    if (recordId) {
      await this.updateAuthRecord(recordId, payload);
    } else if (
      payload.users.length ||
      payload.teachersData.length ||
      payload.studentsData.length ||
      payload.departmentsData.length ||
      payload.subjectsData.length
    ) {
      const created = await this.createAuthRecord(payload);
      recordId = created?._id || null;
    }

    const duplicateIds = records
      .map((record) => record._id)
      .filter((id) => id && id !== recordId);

    for (const id of duplicateIds) {
      try {
        await this.deleteAuthRecord(id);
      } catch (error) {
        console.warn(`Không xóa được bản ghi trùng ${id}:`, error);
      }
    }

    return recordId;
  }

  async saveAuthData(authData, recordId = null) {
    const payload = this.normalizeAuthPayload(authData);

    if (recordId) {
      await this.updateAuthRecord(recordId, payload);
      return recordId;
    }

    const response = await this.fetchWithKey();
    const records = this.extractRecords(response);

    if (records.length > 0) {
      const { recordId: canonicalId } = this.mergeRecords(records);
      return this.consolidateAuthStorage(records, payload, canonicalId);
    }

    const created = await this.createAuthRecord(payload);
    return created?._id || null;
  }

  // Tải từ API; nếu chưa có admin thì seed mẫu và lưu lên API (chỉ 1 document)
  async loadOrInitAuthData() {
    const response = await this.fetchWithKey();
    const records = this.extractRecords(response);
    let { authData, recordId } = this.mergeRecords(records);

    if (!authData.users.length) {
      authData = getDefaultAuthData();
      recordId = await this.consolidateAuthStorage(records, authData, recordId);
      return { authData, recordId, initialized: true };
    }

    authData = this.enrichAuthDataFromDefaults(authData);

    // Chỉ gộp/xóa bản trùng khi thật sự có nhiều document — tránh PUT chậm mỗi lần mở app
    if (records.length > 1) {
      recordId = await this.consolidateAuthStorage(records, authData, recordId);
    }

    return { authData, recordId, initialized: false };
  }

  async getAuthData() {
    try {
      const response = await this.fetchWithKey();
      const { authData } = this.parseAuthDataWithMeta(response);
      console.log('API Users (PDT):', authData.users);
      console.log('API Teachers:', authData.teachersData);
      console.log('API Students:', authData.studentsData);
      console.log('API Departments:', authData.departmentsData);
      console.log('API Courses:', this.pickCourseList(authData));
      return authData;
    } catch (error) {
      console.error('Error getting auth data:', error);
      throw error;
    }
  }

  async ensureAuthContext() {
    if (this._authCache?.recordId) {
      return this._authCache;
    }

    const response = await this.fetchWithKey();
    const records = this.extractRecords(response);
    let { authData, recordId } = this.mergeRecords(records);

    if (!authData.users.length) {
      const init = await this.loadOrInitAuthData();
      this._authCache = { authData: init.authData, recordId: init.recordId };
      return this._authCache;
    }

    authData = this.enrichAuthDataFromDefaults(authData);

    if (records.length > 1) {
      recordId = await this.consolidateAuthStorage(records, authData, recordId);
    }

    this._authCache = { authData, recordId };
    return this._authCache;
  }

  clearAuthCache() {
    this._authCache = null;
  }

  async getTeachers({ fresh = false } = {}) {
    try {
      if (fresh) {
        this.clearAuthCache();
      }
      const { authData } = await this.ensureAuthContext();
      return authData.teachersData || [];
    } catch (error) {
      console.error('Error getting teachers:', error);
      throw error;
    }
  }

  /** Luôn tải mới từ server — dùng khi giáo viên đang online cần biết bị khóa */
  async getTeachersFresh() {
    return this.getTeachers({ fresh: true });
  }

  /** Chỉ 1 request PUT — dùng cache, không fetch/consolidate lại mỗi lần lưu */
  async saveTeachersData(teachers) {
    const { authData, recordId } = await this.ensureAuthContext();

    if (!recordId) {
      const init = await this.loadOrInitAuthData();
      const updatedAuth = { ...init.authData, teachersData: teachers };
      const newId = await this.updateAuthRecord(init.recordId, updatedAuth);
      this._authCache = { authData: updatedAuth, recordId: newId || init.recordId };
      return teachers;
    }

    const updatedAuth = { ...authData, teachersData: teachers };
    await this.updateAuthRecord(recordId, updatedAuth);
    this._authCache = { authData: updatedAuth, recordId };
    return teachers;
  }

  async getStudents({ fresh = false } = {}) {
    try {
      if (fresh) {
        this.clearAuthCache();
      }
      const { authData } = await this.ensureAuthContext();
      return authData.studentsData || [];
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  }

  async getStudentsFresh() {
    return this.getStudents({ fresh: true });
  }

  async saveStudentsData(students) {
    const { authData, recordId } = await this.ensureAuthContext();

    if (!recordId) {
      const init = await this.loadOrInitAuthData();
      const updatedAuth = { ...init.authData, studentsData: students };
      const newId = await this.updateAuthRecord(init.recordId, updatedAuth);
      this._authCache = { authData: updatedAuth, recordId: newId || init.recordId };
      return students;
    }

    const updatedAuth = { ...authData, studentsData: students };
    await this.updateAuthRecord(recordId, updatedAuth);
    this._authCache = { authData: updatedAuth, recordId };
    return students;
  }

  async getDepartments({ fresh = false } = {}) {
    try {
      if (fresh) {
        this.clearAuthCache();
      }
      const { authData } = await this.ensureAuthContext();
      return authData.departmentsData || [];
    } catch (error) {
      console.error('Error getting departments:', error);
      throw error;
    }
  }

  async getDepartmentsFresh() {
    return this.getDepartments({ fresh: true });
  }

  async saveDepartmentsData(departments) {
    const { authData, recordId } = await this.ensureAuthContext();

    if (!recordId) {
      const init = await this.loadOrInitAuthData();
      const updatedAuth = { ...init.authData, departmentsData: departments };
      const newId = await this.updateAuthRecord(init.recordId, updatedAuth);
      this._authCache = { authData: updatedAuth, recordId: newId || init.recordId };
      return departments;
    }

    const updatedAuth = { ...authData, departmentsData: departments };
    await this.updateAuthRecord(recordId, updatedAuth);
    this._authCache = { authData: updatedAuth, recordId };
    return departments;
  }

  async getCourses({ fresh = false } = {}) {
    try {
      if (fresh) {
        this.clearAuthCache();
      }
      const { authData } = await this.ensureAuthContext();
      return this.pickCourseList(authData);
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  }

  async getCoursesFresh() {
    return this.getCourses({ fresh: true });
  }

  async saveCoursesData(courses) {
    const { authData, recordId } = await this.ensureAuthContext();
    const payload = this.buildCoursesPayload(authData, courses);
    const updatedAuth = { ...authData, subjectsData: courses };

    const putCourses = async (id, body) => {
      const response = await fetch(this.buildUrl(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    };

    if (!recordId) {
      const init = await this.loadOrInitAuthData();
      const initPayload = this.buildCoursesPayload(init.authData, courses);
      await putCourses(init.recordId, initPayload);
      const initUpdated = { ...init.authData, subjectsData: courses };
      this._authCache = { authData: initUpdated, recordId: init.recordId };
      return courses;
    }

    await putCourses(recordId, payload);
    this._authCache = { authData: updatedAuth, recordId };
    return courses;
  }

  async getOpenRegistrations({ fresh = false } = {}) {
    try {
      if (fresh) this.clearAuthCache();
      const { authData } = await this.ensureAuthContext();
      return this.pickOpenRegistrations(authData);
    } catch (error) {
      console.error('Error getting open registrations:', error);
      throw error;
    }
  }

  async getOpenRegistrationsFresh() {
    return this.getOpenRegistrations({ fresh: true });
  }

  async saveOpenRegistrationsData(registrations) {
    const { authData, recordId } = await this.ensureAuthContext();
    const updatedAuth = {
      ...authData,
      openRegistrationsData: registrations,
      openRegistrations: [],
    };

    if (!recordId) {
      const init = await this.loadOrInitAuthData();
      const initUpdated = { ...init.authData, openRegistrationsData: registrations, openRegistrations: [] };
      await this.updateAuthRecord(init.recordId, initUpdated);
      this._authCache = { authData: initUpdated, recordId: init.recordId };
      return registrations;
    }

    await this.updateAuthRecord(recordId, updatedAuth);
    this._authCache = { authData: updatedAuth, recordId };
    return registrations;
  }

  async getStudentRegistrations({ fresh = false } = {}) {
    try {
      if (fresh) this.clearAuthCache();
      const { authData } = await this.ensureAuthContext();
      return this.pickStudentRegistrations(authData);
    } catch (error) {
      console.error('Error getting student registrations:', error);
      throw error;
    }
  }

  async getStudentRegistrationsFresh() {
    return this.getStudentRegistrations({ fresh: true });
  }

  async saveStudentRegistrationsData(enrollments) {
    const { authData, recordId } = await this.ensureAuthContext();
    const updatedAuth = {
      ...authData,
      studentRegistrationsData: enrollments,
      studentRegistrations: [],
    };

    if (!recordId) {
      const init = await this.loadOrInitAuthData();
      const initUpdated = {
        ...init.authData,
        studentRegistrationsData: enrollments,
        studentRegistrations: [],
      };
      await this.updateAuthRecord(init.recordId, initUpdated);
      this._authCache = { authData: initUpdated, recordId: init.recordId };
      return enrollments;
    }

    await this.updateAuthRecord(recordId, updatedAuth);
    this._authCache = { authData: updatedAuth, recordId };
    return enrollments;
  }

  async getAssignments({ fresh = false } = {}) {
    try {
      if (fresh) this.clearAuthCache();
      const { authData } = await this.ensureAuthContext();
      return authData.assignmentsData || [];
    } catch (error) {
      console.error('Error getting assignments:', error);
      throw error;
    }
  }

  async getAssignmentsFresh() {
    return this.getAssignments({ fresh: true });
  }

  async saveAssignmentsData(assignments) {
    const { authData, recordId } = await this.ensureAuthContext();
    const updatedAuth = {
      ...authData,
      assignmentsData: assignments,
      assignments: [],
    };

    if (!recordId) {
      const init = await this.loadOrInitAuthData();
      const initUpdated = {
        ...init.authData,
        assignmentsData: assignments,
        assignments: [],
      };
      await this.updateAuthRecord(init.recordId, initUpdated);
      this._authCache = { authData: initUpdated, recordId: init.recordId };
      return assignments;
    }

    await this.updateAuthRecord(recordId, updatedAuth);
    this._authCache = { authData: updatedAuth, recordId };
    return assignments;
  }

  async getDocuments({ fresh = false } = {}) {
    try {
      if (fresh) this.clearAuthCache();
      const { authData } = await this.ensureAuthContext();
      return authData.documentsData || [];
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  async getDocumentsFresh() {
    return this.getDocuments({ fresh: true });
  }

  async saveDocumentsData(documents) {
    const { authData, recordId } = await this.ensureAuthContext();
    const updatedAuth = {
      ...authData,
      documentsData: documents,
      documents: [],
    };

    if (!recordId) {
      const init = await this.loadOrInitAuthData();
      const initUpdated = {
        ...init.authData,
        documentsData: documents,
        documents: [],
      };
      await this.updateAuthRecord(init.recordId, initUpdated);
      this._authCache = { authData: initUpdated, recordId: init.recordId };
      return documents;
    }

    await this.updateAuthRecord(recordId, updatedAuth);
    this._authCache = { authData: updatedAuth, recordId };
    return documents;
  }

  async getUsers() {
    try {
      const response = await this.fetchWithKey();
      return this.parseAuthDataWithMeta(response).authData.users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async isAvailable() {
    try {
      await this.fetchWithKey();
      return true;
    } catch (error) {
      return false;
    }
  }
}

const apiClient = new APIClient();

export default apiClient;
