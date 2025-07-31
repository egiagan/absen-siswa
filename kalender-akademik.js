// =====================================================================
// CALENDAR LOGIC
// =====================================================================
function initializeCalendar() {
    !function() {
        moment.locale('id');
        var today = moment();

        function Calendar(selector, events) {
            this.el = document.querySelector(selector);
            if (!this.el) return;
            this.events = events;
            this.current = moment().date(1);
            this.draw();
            var current = document.querySelector('.today');
            if (current) {
                var self = this;
                window.setTimeout(function() {
                    self.openDay(current);
                }, 500);
            }
        }

        Calendar.prototype.draw = function() {
            this.drawHeader();
            this.drawMonth();
            this.drawLegend();
        }

        Calendar.prototype.drawHeader = function() {
            var self = this;
            if (!this.header) {
                this.header = createElement('div', 'header');
                this.title = createElement('h1');
                var right = createElement('div', 'right');
                right.addEventListener('click', function() { self.nextMonth(); });
                var left = createElement('div', 'left');
                left.addEventListener('click', function() { self.prevMonth(); });
                this.header.appendChild(this.title);
                this.header.appendChild(right);
                this.header.appendChild(left);
                this.el.appendChild(this.header);
            }
            this.title.innerHTML = this.current.format('MMMM YYYY');
        }

        Calendar.prototype.drawMonth = function() {
            var self = this;
            if (this.month) {
                this.oldMonth = this.month;
                this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
                this.oldMonth.addEventListener('webkitAnimationEnd', function() {
                    if (self.oldMonth.parentNode) {
                        self.oldMonth.parentNode.removeChild(self.oldMonth);
                    }
                    self.month = createElement('div', 'month');
                    self.backFill();
                    self.currentMonth();
                    self.forwardFill();
                    self.el.appendChild(self.month);
                    window.setTimeout(function() {
                        self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
                    }, 16);
                });
            } else {
                this.month = createElement('div', 'month');
                this.el.appendChild(this.month);
                this.backFill();
                this.currentMonth();
                this.forwardFill();
                this.month.className = 'month new';
            }
        }

        Calendar.prototype.backFill = function() {
            var clone = this.current.clone();
            var dayOfWeek = clone.day();
            if (!dayOfWeek) { return; }
            clone.subtract(dayOfWeek, 'days');
            for (var i = 0; i < dayOfWeek; i++) {
                this.drawDay(clone.clone());
                clone.add(1, 'days');
            }
        }

        Calendar.prototype.forwardFill = function() {
            var clone = this.current.clone().endOf('month');
            var dayOfWeek = clone.day();
            if (dayOfWeek === 6) { return; }
            clone.add(1, 'days');
            while(clone.day() !== 0) {
                this.drawDay(clone.clone());
                clone.add(1, 'days');
            }
        }

        Calendar.prototype.currentMonth = function() {
            var clone = this.current.clone().startOf('month');
            while (clone.month() === this.current.month()) {
                this.drawDay(clone.clone());
                clone.add(1, 'days');
            }
        }

        Calendar.prototype.getWeek = function(day) {
            if (!this.week || day.day() === 0) {
                this.week = createElement('div', 'week');
                this.month.appendChild(this.week);
            }
        }

        Calendar.prototype.drawDay = function(day) {
            var self = this;
            this.getWeek(day);
            var outer = createElement('div', this.getDayClass(day));
            outer.addEventListener('click', function() {
                self.openDay(this);
            });
            var name = createElement('div', 'day-name', day.format('ddd'));
            var number = createElement('div', 'day-number', day.format('DD'));
            var events = createElement('div', 'day-events');
            this.drawEvents(day, events);
            outer.appendChild(name);
            outer.appendChild(number);
            outer.appendChild(events);
            this.week.appendChild(outer);
        }

        Calendar.prototype.drawEvents = function(day, element) {
            var todaysEvents = this.events.reduce(function(memo, ev) {
                if (ev.date.isSame(day, 'day')) {
                    memo.push(ev);
                }
                return memo;
            }, []);
            todaysEvents.forEach(function(ev) {
                var evSpan = createElement('span', ev.color);
                element.appendChild(evSpan);
            });
        }

        Calendar.prototype.getDayClass = function(day) {
            let classes = ['day'];
            if (day.month() !== this.current.month()) {
                classes.push('other');
            } else if (today.isSame(day, 'day')) {
                classes.push('today');
            }
            return classes.join(' ');
        }

        Calendar.prototype.openDay = function(el) {
            var details, arrow;
            var dayNumber = +el.querySelector('.day-number').innerText || +el.querySelector('.day-number').textContent;
            var day = this.current.clone().date(dayNumber);
            var currentOpened = document.querySelector('.details');
            if (currentOpened && currentOpened.parentNode === el.parentNode) {
                details = currentOpened;
                arrow = document.querySelector('.arrow');
            } else {
                if (currentOpened) {
                    currentOpened.className = 'details out';
                    currentOpened.addEventListener('animationend', function() {
                        if (currentOpened.parentNode) currentOpened.parentNode.removeChild(currentOpened);
                    });
                }
                details = createElement('div', 'details in');
                arrow = createElement('div', 'arrow');
                details.appendChild(arrow);
                el.parentNode.appendChild(details);
            }
            var todaysEvents = this.events.reduce(function(memo, ev) {
                if (ev.date.isSame(day, 'day')) {
                    memo.push(ev);
                }
                return memo;
            }, []);
            this.renderEvents(todaysEvents, details);
            arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + (el.offsetWidth / 2 - 5) + 'px';
        }

        Calendar.prototype.renderEvents = function(events, ele) {
            var currentWrapper = ele.querySelector('.events');
            var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));
            events.forEach(function(ev) {
                var div = createElement('div', 'event');
                var square = createElement('div', 'event-category ' + ev.color);
                var span = createElement('span', '', ev.eventName);
                div.appendChild(square);
                div.appendChild(span);
                wrapper.appendChild(div);
            });
            if (!events.length) {
                var div = createElement('div', 'event empty');
                var span = createElement('span', '', 'Tidak ada acara');
                div.appendChild(span);
                wrapper.appendChild(div);
            }
            if (currentWrapper) {
                currentWrapper.className = 'events out';
                currentWrapper.addEventListener('animationend', function() {
                    if (currentWrapper.parentNode) currentWrapper.parentNode.removeChild(currentWrapper);
                    ele.appendChild(wrapper);
                });
            } else {
                ele.appendChild(wrapper);
            }
        }

        Calendar.prototype.drawLegend = function() {
            var legend = createElement('div', 'legend');
            var calendars = this.events.map(function(e) {
                return e.calendar + '|' + e.color;
            }).reduce(function(memo, e) {
                if (memo.indexOf(e) === -1) {
                    memo.push(e);
                }
                return memo;
            }, []).forEach(function(e) {
                var parts = e.split('|');
                var entry = createElement('span', 'entry ' + parts[1], parts[0]);
                legend.appendChild(entry);
            });
            let existingLegend = this.el.querySelector('.legend');
            if(existingLegend) this.el.removeChild(existingLegend);
            this.el.appendChild(legend);
        }

        Calendar.prototype.nextMonth = function() {
            this.current.add(1, 'months');
            this.next = true;
            this.draw();
        }

        Calendar.prototype.prevMonth = function() {
            this.current.subtract(1, 'months');
            this.next = false;
            this.draw();
        }

        window.Calendar = Calendar;

        function createElement(tagName, className, innerText) {
            var ele = document.createElement(tagName);
            if (className) {
                ele.className = className;
            }
            if (innerText) {
                ele.innerText = ele.textContent = innerText;
            }
            return ele;
        }
    }();

    !function() {
        var data = [
            { eventName: 'MPLS', calendar: 'Akademik', color: 'blue', date: moment('2025-07-14') },
            { eventName: 'MPLS', calendar: 'Akademik', color: 'blue', date: moment('2025-07-15') },
            { eventName: 'MPLS', calendar: 'Akademik', color: 'blue', date: moment('2025-07-16') },
            { eventName: 'MPLS', calendar: 'Akademik', color: 'blue', date: moment('2025-07-17') },
            { eventName: 'MPLS', calendar: 'Akademik', color: 'blue', date: moment('2025-07-18') },
            { eventName: 'MPLS', calendar: 'Akademik', color: 'blue', date: moment('2025-07-19') },
            { eventName: 'Libur Hari Kemerdekaan RI ke-80', calendar: 'Hari Libur', color: 'green', date: moment('2025-08-17') },
            { eventName: 'Lomba HUT RI', calendar: 'Acara Sekolah', color: 'orange', date: moment('2025-08-18') },
            { eventName: 'Libur Maulid Nabi Muhammad SAW', calendar: 'Hari Libur', color: 'green', date: moment('2025-09-05') },
            { eventName: 'Sulingjar', calendar: 'Akademik', color: 'blue', date: moment('2025-09-15') },
            { eventName: 'ANBK Kelas 5', calendar: 'Akademik', color: 'blue', date: moment('2025-09-22') },
            { eventName: 'ANBK Kelas 5', calendar: 'Akademik', color: 'blue', date: moment('2025-09-23') },
            { eventName: 'ANBK Kelas 5', calendar: 'Akademik', color: 'blue', date: moment('2025-09-24') },
            { eventName: 'ANBK Kelas 5', calendar: 'Akademik', color: 'blue', date: moment('2025-09-25') },
            { eventName: 'HUT PGRI', calendar: 'Acara Sekolah', color: 'orange', date: moment('2025-11-25') },
            { eventName: 'HUT PGRI', calendar: 'Acara Sekolah', color: 'orange', date: moment('2025-11-26') },
            ...Array.from({length: 14}, (_, i) => ({ eventName: 'Prakiraan ASAS Semester 1', calendar: 'Akademik', color: 'blue', date: moment(`2025-12-${i + 1}`) })),
            { eventName: 'Pembagian Rapot', calendar: 'Akademik', color: 'blue', date: moment('2025-12-24') },
            ...Array.from({length: 7}, (_, i) => ({ eventName: 'Libur Semester 1', calendar: 'Hari Libur', color: 'green', date: moment(`2025-12-${i + 25}`) })),
            ...Array.from({length: 10}, (_, i) => ({ eventName: 'Libur Semester 1', calendar: 'Hari Libur', color: 'green', date: moment(`2026-01-${i + 1}`) })),
            { eventName: 'Tahun Baru 2026', calendar: 'Hari Libur', color: 'green', date: moment('2026-01-01') },
            { eventName: 'Awal Masuk Semester 2', calendar: 'Akademik', color: 'blue', date: moment('2026-01-12') },
            { eventName: 'Libur Isra Mi’raj', calendar: 'Hari Libur', color: 'green', date: moment('2026-01-16') },
            { eventName: 'Libur Tahun Baru Imlek', calendar: 'Hari Libur', color: 'green', date: moment('2026-02-17') },
            ...Array.from({length: 4}, (_, i) => ({ eventName: 'Prakiraan Awal Ramadhan', calendar: 'Lainnya', color: 'yellow', date: moment(`2026-02-${i + 20}`) })),
            ...Array.from({length: 5}, (_, i) => ({ eventName: 'Kegiatan Budi Pekerti', calendar: 'Lainnya', color: 'yellow', date: moment(`2026-02-${i + 24}`) })),
            ...Array.from({length: 12}, (_, i) => ({ eventName: 'Kegiatan Budi Pekerti', calendar: 'Lainnya', color: 'yellow', date: moment(`2026-03-${i + 2}`) })),
            ...Array.from({length: 15}, (_, i) => ({ eventName: 'Libur Hari Raya Idul Fitri', calendar: 'Hari Libur', color: 'green', date: moment(`2026-03-${i + 14}`) })),
            { eventName: 'Libur Hari Raya Nyepi', calendar: 'Hari Libur', color: 'green', date: moment('2026-03-19') },
            { eventName: 'Prakiraan Idul Fitri 1448H', calendar: 'Hari Libur', color: 'green', date: moment('2026-03-21') },
            { eventName: 'Libur Wafat Isa Al-Masih', calendar: 'Hari Libur', color: 'green', date: moment('2026-04-03') },
            { eventName: 'Libur Hari Buruh', calendar: 'Hari Libur', color: 'green', date: moment('2026-05-01') },
            { eventName: 'Hari Pendidikan Nasional', calendar: 'Acara Sekolah', color: 'orange', date: moment('2026-05-02') },
            ...Array.from({length: 13}, (_, i) => ({ eventName: 'PSAJ Kelas 6', calendar: 'Akademik', color: 'blue', date: moment(`2026-05-${i + 11}`) })),
            { eventName: 'Prakiraan Hari Raya Idul Adha', calendar: 'Hari Libur', color: 'green', date: moment('2026-05-26') },
            { eventName: 'Prakiraan Hari Raya Idul Adha', calendar: 'Hari Libur', color: 'green', date: moment('2026-05-27') },
            { eventName: 'Hari Raya Waisak', calendar: 'Hari Libur', color: 'green', date: moment('2026-05-31') },
            { eventName: 'Libur Hari Lahir Pancasila', calendar: 'Hari Libur', color: 'green', date: moment('2026-06-01') },
            ...Array.from({length: 12}, (_, i) => ({ eventName: 'Prakiraan ASAT Kelas 1-5', calendar: 'Akademik', color: 'blue', date: moment(`2026-06-${i + 2}`) })),
            { eventName: 'Libur Tahun Baru Islam', calendar: 'Hari Libur', color: 'green', date: moment('2026-06-16') },
            { eventName: 'Pembagian Rapot', calendar: 'Akademik', color: 'blue', date: moment('2026-06-26') },
            ...Array.from({length: 4}, (_, i) => ({ eventName: 'Libur Semester 2', calendar: 'Hari Libur', color: 'green', date: moment(`2026-06-${i + 27}`) })),
            ...Array.from({length: 10}, (_, i) => ({ eventName: 'Libur Semester 2', calendar: 'Hari Libur', color: 'green', date: moment(`2026-07-${i + 1}`) })),
        ];
        
        var calendar = new Calendar('#calendar', data);

    }();
}
