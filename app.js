
        document.addEventListener('DOMContentLoaded', function() {
            // Navegación entre secciones
            const navLinks = document.querySelectorAll('.nav-link');
            const sections = document.querySelectorAll('.section');
            
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const target = this.getAttribute('data-target');
                    
                    // Actualizar navegación activa
                    navLinks.forEach(navLink => navLink.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Mostrar sección activa
                    sections.forEach(section => section.classList.remove('active'));
                    document.getElementById(target).classList.add('active');
                });
            });
            
            // Almacenamiento de datos
            let courses = JSON.parse(localStorage.getItem('courses')) || [];
            let loans = JSON.parse(localStorage.getItem('loans')) || [];
            
            // Inicializar la aplicación
            initApp();
            
            // Función para inicializar la aplicación
            function initApp() {
                updateCourseSelect();
                renderCourses();
                renderLoans();
                updateDashboard();
                updateReports();
            }
            
            // Formulario de cursos
            const courseForm = document.getElementById('course-form');
            courseForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const course = {
                    id: Date.now(),
                    name: document.getElementById('course-name').value,
                    instructor: document.getElementById('course-instructor').value,
                    duration: document.getElementById('course-duration').value,
                    description: document.getElementById('course-description').value,
                    createdAt: new Date().toISOString()
                };
                
                courses.push(course);
                saveCourses();
                renderCourses();
                updateCourseSelect();
                updateDashboard();
                updateReports();
                
                showAlert('Curso registrado exitosamente', 'success');
                courseForm.reset();
            });
            
            // Formulario de préstamos
            const loanForm = document.getElementById('loan-form');
            loanForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const loanDate = new Date(document.getElementById('loan-date').value);
                const returnDate = new Date(document.getElementById('loan-return').value);
                
                if (returnDate <= loanDate) {
                    showAlert('La fecha de devolución debe ser posterior a la fecha de préstamo', 'danger');
                    return;
                }
                
                const loan = {
                    id: Date.now(),
                    student: document.getElementById('loan-student').value,
                    material: document.getElementById('loan-material').value,
                    courseId: document.getElementById('loan-course').value,
                    loanDate: document.getElementById('loan-date').value,
                    returnDate: document.getElementById('loan-return').value,
                    status: 'active',
                    createdAt: new Date().toISOString()
                };
                
                loans.push(loan);
                saveLoans();
                renderLoans();
                updateDashboard();
                updateReports();
                
                showAlert('Préstamo registrado exitosamente', 'success');
                loanForm.reset();
            });
            
            // Función para guardar cursos en localStorage
            function saveCourses() {
                localStorage.setItem('courses', JSON.stringify(courses));
            }
            
            // Función para guardar préstamos en localStorage
            function saveLoans() {
                localStorage.setItem('loans', JSON.stringify(loans));
            }
            
            // Función para renderizar cursos en la tabla
            function renderCourses() {
                const coursesList = document.getElementById('courses-list');
                
                if (courses.length === 0) {
                    coursesList.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay cursos registrados</td></tr>';
                    return;
                }
                
                coursesList.innerHTML = '';
                courses.forEach(course => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${course.name}</td>
                        <td>${course.instructor}</td>
                        <td>${course.duration} horas</td>
                        <td class="actions">
                            <button class="btn-danger" onclick="deleteCourse(${course.id})">🗑</button>
                        </td>
                    `;
                    coursesList.appendChild(row);
                });
            }
            
            // Función para renderizar préstamos en la tabla
            function renderLoans() {
                const loansList = document.getElementById('loans-list');
                
                if (loans.length === 0) {
                    loansList.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay préstamos registrados</td></tr>';
                    return;
                }
                
                loansList.innerHTML = '';
                loans.forEach(loan => {
                    const course = courses.find(c => c.id == loan.courseId) || { name: 'Curso no disponible' };
                    const today = new Date();
                    const returnDate = new Date(loan.returnDate);
                    let status = loan.status;
                    
                    if (status === 'active' && returnDate < today) {
                        status = 'overdue';
                    }
                    
                    const statusText = status === 'active' ? 'Activo' : 
                                      status === 'completed' ? 'Completado' : 'Vencido'  ;
                    
                    const statusClass = status === 'active' ? '' : 
                                      status === 'completed' ? 'btn-success' : 'btn-danger';
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${loan.student}</td>
                        <td>${loan.material}</td>
                        <td>${course.name}</td>
                        <td>${formatDate(loan.loanDate)}</td>
                        <td>${formatDate(loan.returnDate)}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                        <td class="actions">
                            ${status === 'active' ? 
                                `<button class="btn-success" onclick="completeLoan(${loan.id})">✔</button>` : ''}
                            <button class="btn-danger" onclick="deleteLoan(${loan.id})"> 🗑</button>
                        </td>
                    `;
                    loansList.appendChild(row);
                });
            }
            
            // Función para actualizar el selector de cursos en el formulario de préstamos
            function updateCourseSelect() {
                const courseSelect = document.getElementById('loan-course');
                courseSelect.innerHTML = '<option value="">Seleccione un curso</option>';
                
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.id;
                    option.textContent = course.name;
                    courseSelect.appendChild(option);
                });
            }
            
            // Función para actualizar el dashboard
            function updateDashboard() {
                document.getElementById('total-courses').textContent = courses.length;
                
                const activeLoans = loans.filter(loan => loan.status === 'active').length;
                document.getElementById('active-loans').textContent = activeLoans;
                
                const today = new Date();
                const overdueLoans = loans.filter(loan => {
                    return loan.status === 'active' && new Date(loan.returnDate) < today;
                }).length;
                
                document.getElementById('overdue-loans').textContent = overdueLoans;
                
                // Mostrar préstamos recientes (últimos 5)
                const recentLoansList = document.getElementById('recent-loans');
                const recentLoans = [...loans].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
                
                if (recentLoans.length === 0) {
                    recentLoansList.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay préstamos recientes</td></tr>';
                } else {
                    recentLoansList.innerHTML = '';
                    recentLoans.forEach(loan => {
                        const course = courses.find(c => c.id == loan.courseId) || { name: 'N/A' };
                        const today = new Date();
                        const returnDate = new Date(loan.returnDate);
                        let status = loan.status;
                        
                        if (status === 'active' && returnDate < today) {
                            status = 'overdue';
                        }
                        
                        const statusText = status === 'active' ? 'Activo' : 
                                          status === 'completed' ? 'Completado' : 'Vencido';
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${loan.student}</td>
                            <td>${loan.material}</td>
                            <td>${formatDate(loan.loanDate)}</td>
                            <td>${statusText}</td>
                        `;
                        recentLoansList.appendChild(row);
                    });
                }
                
                // Mostrar cursos disponibles
                const availableCoursesList = document.getElementById('available-courses');
                
                if (courses.length === 0) {
                    availableCoursesList.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay cursos disponibles</td></tr>';
                } else {
                    availableCoursesList.innerHTML = '';
                    courses.slice(0, 5).forEach(course => {
                        const courseLoans = loans.filter(loan => loan.courseId == course.id).length;
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${course.name}</td>
                            <td>${course.instructor}</td>
                            <td>${course.duration} horas</td>
                            <td>${courseLoans}</td>
                        `;
                        availableCoursesList.appendChild(row);
                    });
                }
            }
            
            // Función para actualizar reportes
            function updateReports() {
                document.getElementById('total-loans').textContent = loans.length;
                
                const activeLoans = loans.filter(loan => loan.status === 'active').length;
                document.getElementById('report-active-loans').textContent = activeLoans;
                
                const completedLoans = loans.filter(loan => loan.status === 'completed').length;
                document.getElementById('completed-loans').textContent = completedLoans;
                
                const today = new Date();
                const overdueLoans = loans.filter(loan => {
                    return loan.status === 'active' && new Date(loan.returnDate) < today;
                }).length;
                
                document.getElementById('report-overdue-loans').textContent = overdueLoans;
                
                // Préstamos por curso
                const loansByCourse = document.getElementById('loans-by-course');
                const courseStats = {};
                
                courses.forEach(course => {
                    courseStats[course.id] = {
                        name: course.name,
                        count: 0
                    };
                });
                
                loans.forEach(loan => {
                    if (courseStats[loan.courseId]) {
                        courseStats[loan.courseId].count++;
                    }
                });
                
                loansByCourse.innerHTML = '';
                if (Object.keys(courseStats).length === 0) {
                    loansByCourse.innerHTML = '<tr><td colspan="2" style="text-align: center;">No hay datos disponibles</td></tr>';
                } else {
                    for (const courseId in courseStats) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${courseStats[courseId].name}</td>
                            <td>${courseStats[courseId].count}</td>
                        `;
                        loansByCourse.appendChild(row);
                    }
                }
            }
            
            // Función para mostrar alertas
            function showAlert(message, type) {
                const alertBox = document.getElementById('alertBox');
                alertBox.textContent = message;
                alertBox.className = `alert alert-${type}`;
                alertBox.style.display = 'block';
                
                setTimeout(() => {
                    alertBox.style.display = 'none';
                }, 3000);
            }
            
            // Función para formatear fechas
            function formatDate(dateString) {
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                return new Date(dateString).toLocaleDateString('es-ES', options);
            }
            
            // Funciones globales para los botones de acción
            window.deleteCourse = function(courseId) {
                if (confirm('¿Está seguro de que desea eliminar este curso?')) {
                    courses = courses.filter(course => course.id !== courseId);
                    saveCourses();
                    renderCourses();
                    updateCourseSelect();
                    updateDashboard();
                    updateReports();
                    showAlert('Curso eliminado exitosamente', 'success');
                }
            };
            
            window.deleteLoan = function(loanId) {
                if (confirm('¿Está seguro de que desea eliminar este préstamo?')) {
                    loans = loans.filter(loan => loan.id !== loanId);
                    saveLoans();
                    renderLoans();
                    updateDashboard();
                    updateReports();
                    showAlert('Préstamo eliminado exitosamente', 'success');
                }
            };
            
            window.completeLoan = function(loanId) {
                const loanIndex = loans.findIndex(loan => loan.id === loanId);
                if (loanIndex !== -1) {
                    loans[loanIndex].status = 'completed';
                    saveLoans();
                    renderLoans();
                    updateDashboard();
                    updateReports();
                    showAlert('Préstamo marcado como completado', 'success');
                }
            };
        });
