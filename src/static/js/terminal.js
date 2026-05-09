(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const data = window.__TERMINAL_DATA__ || {};
        const dropdownBodyContent = data.dropdownBodyContent || [];
        const contentSegments = data.contentSegments || [];
        const navigationLinks = data.navigationLinks || [];
        const searchIndex = data.searchIndex || [];
        const inputPrompt = data.inputPrompt || 'Enter module ID:';
        const typeSpeed = data.typeSpeed || 5;
        const initialDelayMs = data.initialDelayMs || 500;

        const navigationMap = Object.fromEntries(navigationLinks.map(function (link) {
            return [link.id, link.href];
        }));

        const toggle = document.getElementById('themeToggle');
        const body = document.body;

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'classic') {
            body.classList.add('classic-theme');
        }
        toggle.setAttribute('aria-pressed', body.classList.contains('classic-theme') ? 'true' : 'false');

        toggle.addEventListener('click', function () {
            body.classList.toggle('classic-theme');
            const isClassic = body.classList.contains('classic-theme');
            localStorage.setItem('theme', isClassic ? 'classic' : 'cyberpunk');
            toggle.setAttribute('aria-pressed', isClassic ? 'true' : 'false');
        });

        const terminalScreen = document.querySelector('.terminal-screen');
        const terminalText = document.getElementById('terminal-text');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let currentSegment = 0;

        function processNextSegment() {
            if (currentSegment >= contentSegments.length) {
                document.getElementById('cursor').style.display = 'inline-block';
                document.addEventListener('keydown', handleInput);
                setupMobileInput();
                openDropdownFromHash();
                return;
            }

            const segment = contentSegments[currentSegment];
            currentSegment++;

            if (segment.type === 'type') {
                typeContent(segment.content, 0, processNextSegment);
            } else if (segment.type === 'element') {
                const el = document.createElement(segment.tag);
                if (segment.className) el.className = segment.className;
                terminalText.appendChild(el);
                const speed = segment.speed || 1;
                typeIntoElement(el, segment.text, 0, speed, function () {
                    if (segment.addBreak) terminalText.appendChild(document.createElement('br'));
                    processNextSegment();
                });
            } else if (segment.type === 'dropdown') {
                const dropdown = document.createElement('div');
                dropdown.className = 'dropdown';
                if (segment.slug) dropdown.id = segment.slug;
                const toggleLink = document.createElement('a');
                toggleLink.className = 'terminal-link-menu dropdown-toggle';
                const strong = document.createElement('strong');
                toggleLink.appendChild(strong);
                const textSpan = document.createElement('h3');
                textSpan.className = 'h3';
                toggleLink.appendChild(textSpan);
                dropdown.appendChild(toggleLink);
                const content = document.createElement('div');
                content.className = 'dropdown-content';
                dropdown.appendChild(content);
                terminalText.appendChild(dropdown);
                typeIntoElement(strong, '[+]', 0, 1, function () {
                    typeIntoElement(textSpan, segment.text.substring(3), 0, 1, processNextSegment);
                });
            } else if (segment.type === 'navlink') {
                const link = document.createElement('a');
                link.href = segment.href;
                link.className = 'terminal-link-menu';
                const strong = document.createElement('strong');
                const textSpan = document.createElement('span');
                link.appendChild(strong);
                link.appendChild(textSpan);
                terminalText.appendChild(link);
                const bracketEnd = segment.text.indexOf(']') + 1;
                typeIntoElement(strong, segment.text.substring(0, bracketEnd), 0, 1, function () {
                    typeIntoElement(textSpan, segment.text.substring(bracketEnd), 0, 1, function () {
                        terminalText.appendChild(document.createElement('br'));
                        if (segment.extraBreak) terminalText.appendChild(document.createElement('br'));
                        processNextSegment();
                    });
                });
            } else if (segment.type === 'inlinelink') {
                const link = document.createElement('a');
                link.href = segment.href;
                link.className = 'terminal-link-inline';
                terminalText.appendChild(link);
                typeIntoElement(link, segment.text, 0, 1, processNextSegment);
            } else if (segment.type === 'buttonlink') {
                const link = document.createElement('a');
                link.href = segment.href;
                link.className = 'terminal-link';
                if (segment.openInNewTab === false) {
                    link.target = '_self';
                } else {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
                terminalText.appendChild(link);
                typeIntoElement(link, segment.text, 0, 1, processNextSegment);
            } else if (segment.type === 'inject') {
                const temp = document.createElement('div');
                temp.innerHTML = segment.html;
                while (temp.firstChild) {
                    terminalText.appendChild(temp.firstChild);
                }
                const images = terminalText.querySelectorAll('.media-dialup-container img:not(.dialup-reveal)');
                images.forEach(function (img) {
                    if (img.complete) {
                        img.classList.add('dialup-reveal');
                    } else {
                        img.addEventListener('load', function () {
                            img.classList.add('dialup-reveal');
                        });
                    }
                });
                processNextSegment();
            } else {
                processNextSegment();
            }
        }

        function typeContent(content, index, callback) {
            if (reducedMotion) {
                const frag = document.createDocumentFragment();
                for (let i = index; i < content.length; i++) {
                    if (content[i] === '\n') {
                        frag.appendChild(document.createElement('br'));
                    } else {
                        frag.appendChild(document.createTextNode(content[i]));
                    }
                }
                terminalText.appendChild(frag);
                callback();
                return;
            }
            if (index >= content.length) { callback(); return; }
            const char = content[index];
            if (char === '\n') {
                terminalText.appendChild(document.createElement('br'));
            } else {
                terminalText.appendChild(document.createTextNode(char));
            }
            setTimeout(function () { typeContent(content, index + 1, callback); }, typeSpeed);
        }

        function typeIntoElement(element, text, index, speed, callback) {
            if (reducedMotion) {
                element.textContent += text.substring(index);
                callback();
                return;
            }
            if (index >= text.length) { callback(); return; }
            element.textContent += text[index];
            setTimeout(function () { typeIntoElement(element, text, index + 1, speed, callback); }, typeSpeed * speed);
        }

        setTimeout(function () {
            terminalScreen.classList.remove('terminal-loading');
            initDropdowns();
            processNextSegment();
        }, initialDelayMs);

        document.getElementById('cursor').style.display = 'none';

        let currentInput = "";
        let pendingSearchResults = null;
        const inputDisplay = document.getElementById('user-input-display');
        const mobileInput = document.getElementById('mobile-input');
        const cursor = document.getElementById('cursor');

        function normalizeSearchText(value) {
            return String(value || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, ' ')
                .trim();
        }

        function countOccurrences(haystack, needle) {
            if (!needle) return 0;
            let count = 0;
            let index = haystack.indexOf(needle);
            while (index !== -1) {
                count += 1;
                index = haystack.indexOf(needle, index + needle.length);
            }
            return count;
        }

        function scoreSearchResult(item, query, terms) {
            const title = normalizeSearchText(item.title);
            const pageTitle = normalizeSearchText(item.pageTitle);
            const sectionTitle = normalizeSearchText(item.sectionTitle);
            const text = normalizeSearchText(item.text);
            const haystack = [title, pageTitle, sectionTitle, text].join(' ');

            if (!terms.every(function (term) { return haystack.includes(term); })) return 0;

            let score = 10;
            if (title === query) score += 100;
            if (title.includes(query)) score += 60;
            if (pageTitle.includes(query)) score += 25;
            if (sectionTitle.includes(query)) score += 20;
            if (text.includes(query)) score += 15;
            terms.forEach(function (term) {
                score += countOccurrences(haystack, term);
            });
            return score;
        }

        function searchProjects(query) {
            const normalizedQuery = normalizeSearchText(query);
            if (!normalizedQuery) return [];
            const terms = normalizedQuery.split(/\s+/).filter(Boolean);

            return searchIndex
                .map(function (item) {
                    return { item: item, score: scoreSearchResult(item, normalizedQuery, terms) };
                })
                .filter(function (result) { return result.score > 0; })
                .sort(function (a, b) {
                    if (b.score !== a.score) return b.score - a.score;
                    return String(a.item.title || '').localeCompare(String(b.item.title || ''));
                })
                .map(function (result) { return result.item; });
        }

        function resetInput() {
            currentInput = "";
            inputDisplay.textContent = currentInput;
            mobileInput.value = "";
        }

        function appendTerminalOutput(text) {
            terminalText.appendChild(document.createTextNode(text));
        }

        function appendSearchResultLink(result, index) {
            const link = document.createElement('a');
            link.href = result.href;
            link.className = 'terminal-link-menu search-result-link';

            const number = document.createElement('strong');
            number.textContent = '[' + index + ']';

            const label = document.createElement('span');
            label.textContent = '  ' + result.pageTitle + ' / ' + result.title;

            link.appendChild(number);
            link.appendChild(label);
            terminalText.appendChild(link);
            terminalText.appendChild(document.createElement('br'));
        }

        function showPrompt() {
            appendTerminalOutput('\n' + inputPrompt);
        }

        function showError(message) {
            inputDisplay.textContent = message || 'Error';
            inputDisplay.classList.add('error');
            setTimeout(function () {
                resetInput();
                inputDisplay.classList.remove('error');
            }, 2000);
        }

        function handleSearchCommand(command) {
            const query = command.replace(/^grep\s+/i, '').trim();
            if (!query) {
                appendTerminalOutput(command + '\n\nusage: grep "keyword"');
                resetInput();
                showPrompt();
                return;
            }

            if (!searchIndex.length) {
                appendTerminalOutput(command + '\n\nsearch index unavailable; refresh this page and try again');
                resetInput();
                showPrompt();
                return;
            }

            const results = searchProjects(query);

            if (results.length === 1) {
                window.location.href = results[0].href;
                return;
            }

            appendTerminalOutput(command + '\n\n');
            resetInput();

            if (!results.length) {
                appendTerminalOutput('grep: no matches found for "' + query + '"\ntry: seo, crm, video, automation, outreach, websites');
                showPrompt();
                return;
            }

            const visibleResults = results.slice(0, 6);
            pendingSearchResults = visibleResults;
            appendTerminalOutput(results.length + ' matches found:\n\n');
            visibleResults.forEach(function (result, index) {
                appendSearchResultLink(result, index);
            });
            if (results.length > visibleResults.length) {
                appendTerminalOutput('\nshowing first ' + visibleResults.length + '; narrow your grep for more precision\n');
            }
            appendTerminalOutput('\nenter result ID [0-' + (visibleResults.length - 1) + ']:');
        }

        function handleSearchSelection(command) {
            const index = Number(command);
            if (
                Number.isInteger(index) &&
                pendingSearchResults &&
                pendingSearchResults[index]
            ) {
                window.location.href = pendingSearchResults[index].href;
                return;
            }

            appendTerminalOutput(command + '\n\ninvalid result ID');
            pendingSearchResults = null;
            resetInput();
            showPrompt();
        }

        function submitCurrentInput() {
            const command = currentInput.trim();
            if (!command) return;

            if (pendingSearchResults) {
                handleSearchSelection(command);
                return;
            }

            if (navigationMap.hasOwnProperty(command)) {
                window.location.href = navigationMap[command];
            } else if (/^grep(?:\s+|$)/i.test(command)) {
                handleSearchCommand(command);
            } else {
                showError('Error');
            }
        }

        function handleInput(event) {
            const key = event.key;
            if (inputDisplay.classList.contains('error')) return;

            if (key === 'Enter') {
                submitCurrentInput();
                return;
            }
            if (key === 'Backspace') {
                currentInput = currentInput.slice(0, -1);
                inputDisplay.textContent = currentInput;
                return;
            }
            if (key.length === 1 && currentInput.length < 80) {
                currentInput += key;
                inputDisplay.textContent = currentInput;
            }
        }

        function setupMobileInput() {
            const mobileForm = document.getElementById('mobile-form');

            function scrollCursorIntoView() {
                setTimeout(function () {
                    cursor.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    setTimeout(function () {
                        cursor.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                    }, 300);
                }, 100);
            }

            cursor.addEventListener('click', function (e) {
                e.stopPropagation();
                mobileInput.focus();
                scrollCursorIntoView();
            });

            inputDisplay.addEventListener('click', function (e) {
                e.stopPropagation();
                mobileInput.focus();
                scrollCursorIntoView();
            });

            mobileInput.addEventListener('focus', function () {
                scrollCursorIntoView();
            });

            mobileInput.addEventListener('input', function (e) {
                if (inputDisplay.classList.contains('error')) {
                    this.value = "";
                    return;
                }
                if (this.value.length > 80) {
                    this.value = this.value.slice(0, 80);
                }
                currentInput = this.value;
                inputDisplay.textContent = currentInput;
            });

            function handleMobileSubmit() {
                if (inputDisplay.classList.contains('error')) return;
                submitCurrentInput();
            }

            mobileForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleMobileSubmit();
            });

            mobileInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleMobileSubmit();
                }
            });

            mobileInput.addEventListener('blur', function (e) {
                if (currentInput.trim() !== "") {
                    handleMobileSubmit();
                }
            });
        }

        function openDropdownFromHash() {
            const hash = window.location.hash.replace(/^#/, '');
            if (!hash) return;
            const target = document.getElementById(hash);
            if (!target || !target.classList.contains('dropdown')) return;
            const toggle = target.querySelector('.dropdown-toggle');
            if (!toggle) return;
            toggle.click();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        window.addEventListener('hashchange', openDropdownFromHash);

        function setProjectHash(dropdown, isOpen) {
            if (!dropdown || !dropdown.id || !window.history || !window.history.replaceState) return;
            const nextUrl = isOpen
                ? '#' + dropdown.id
                : window.location.pathname + window.location.search;
            if (isOpen || window.location.hash === '#' + dropdown.id) {
                window.history.replaceState(null, '', nextUrl);
            }
        }

        function initDropdowns() {
            terminalScreen.addEventListener('click', function (e) {
                const dropdownToggle = e.target.closest('.dropdown-toggle');
                if (!dropdownToggle) return;
                e.preventDefault();
                const dropdown = dropdownToggle.closest('.dropdown');
                if (!dropdown) return;
                if (dropdown.dataset.animating === 'true') return;

                const content = dropdown.querySelector('.dropdown-content');
                const needsContent = content && content.innerHTML.trim() === '' && !content.dataset.loaded;

                if (needsContent) {
                    const allDropdowns = document.querySelectorAll('.dropdown');
                    let dropdownIndex = -1;
                    allDropdowns.forEach(function (d, i) { if (d === dropdown) dropdownIndex = i; });
                    if (dropdownIndex >= 0 && dropdownBodyContent[dropdownIndex]) {
                        content.dataset.loaded = 'true';
                        dropdown.dataset.animating = 'true';
                        dropdown.classList.add('open');
                        setProjectHash(dropdown, true);
                        const strong = dropdownToggle.querySelector('strong');
                        if (strong) strong.textContent = '[-]';
                        document.querySelectorAll('.dropdown.open').forEach(function (openDropdown) {
                            if (openDropdown !== dropdown) {
                                openDropdown.classList.remove('open');
                                const openStrong = openDropdown.querySelector('.dropdown-toggle strong');
                                if (openStrong) openStrong.textContent = '[+]';
                            }
                        });
                        typeDropdownContent(content, dropdownBodyContent[dropdownIndex], function () {
                            dropdown.dataset.animating = 'false';
                            initSliders();
                        });
                        return;
                    }
                }

                document.querySelectorAll('.dropdown.open').forEach(function (openDropdown) {
                    if (openDropdown !== dropdown) {
                        openDropdown.classList.remove('open');
                        const openStrong = openDropdown.querySelector('.dropdown-toggle strong');
                        if (openStrong) openStrong.textContent = '[+]';
                    }
                });

                dropdown.classList.toggle('open');
                setProjectHash(dropdown, dropdown.classList.contains('open'));
                const strong = dropdownToggle.querySelector('strong');
                if (strong) {
                    strong.textContent = dropdown.classList.contains('open') ? '[-]' : '[+]';
                }
            });
        }

        function typeDropdownContent(container, htmlContent, callback) {
            if (reducedMotion) {
                container.innerHTML = htmlContent;
                container.querySelectorAll('img, iframe').forEach(function (media) {
                    media.classList.add('dialup-reveal');
                });
                callback();
                return;
            }
            let index = 0;
            const dropdownTypeSpeed = 5;

            function processNext() {
                if (index >= htmlContent.length) { callback(); return; }

                if (htmlContent[index] === '<' && htmlContent[index + 1] !== '!' && /[a-zA-Z\/]/.test(htmlContent[index + 1])) {
                    const tagMatch = htmlContent.substring(index).match(/^<(\/?)([\w-]+)/);
                    if (tagMatch && !tagMatch[1]) {
                        const tagName = tagMatch[2].toLowerCase();
                        const selfClosingTags = ['br', 'img', 'input', 'hr', 'meta', 'link'];

                        if (selfClosingTags.includes(tagName)) {
                            const endIndex = htmlContent.indexOf('>', index) + 1;
                            const htmlElement = htmlContent.substring(index, endIndex);
                            const temp = document.createElement('div');
                            temp.innerHTML = htmlElement;
                            while (temp.firstChild) {
                                const child = temp.firstChild;
                                container.appendChild(child);
                                if (child.tagName === 'IMG') {
                                    child.classList.add('dialup-reveal');
                                }
                            }
                            index = endIndex;
                            setTimeout(processNext, dropdownTypeSpeed);
                            return;
                        }

                        const closingTag = '</' + tagName + '>';
                        let depth = 0;
                        let endIndex = -1;
                        let i = index;
                        while (i < htmlContent.length) {
                            const openMatch = htmlContent.substring(i).match(new RegExp('^<' + tagName + '(\\s|>)', 'i'));
                            if (openMatch) {
                                depth++;
                                i += tagName.length + 1;
                                continue;
                            }
                            if (htmlContent.substring(i, i + closingTag.length).toLowerCase() === closingTag) {
                                depth--;
                                if (depth === 0) { endIndex = i + closingTag.length; break; }
                            }
                            i++;
                        }

                        if (endIndex > index) {
                            const htmlElement = htmlContent.substring(index, endIndex);
                            const temp = document.createElement('div');
                            temp.innerHTML = htmlElement;
                            while (temp.firstChild) {
                                const child = temp.firstChild;
                                container.appendChild(child);
                                applyDialupAnimation(child);
                            }
                            index = endIndex;
                            setTimeout(processNext, dropdownTypeSpeed * 3);
                            return;
                        }
                    }
                }

                container.appendChild(document.createTextNode(htmlContent[index]));
                index++;
                setTimeout(processNext, dropdownTypeSpeed);
            }

            processNext();
        }

        function applyDialupAnimation(element) {
            if (!element || !element.querySelectorAll) return;
            const mediaElements = element.querySelectorAll('img, iframe');
            mediaElements.forEach(function (media) {
                media.classList.add('dialup-reveal');
            });
            if (element.tagName === 'IMG' || element.tagName === 'IFRAME') {
                element.classList.add('dialup-reveal');
            }
            if (element.classList && element.classList.contains('media-dialup-container')) {
                const childMedia = element.querySelector('img, iframe');
                if (childMedia) childMedia.classList.add('dialup-reveal');
            }
        }

        function initSliders() {
            document.querySelectorAll('[data-slider]').forEach(function (slider) {
                if (slider.dataset.initialized) return;
                slider.dataset.initialized = 'true';
                const track = slider.querySelector('.media-slider-track');
                const slides = slider.querySelectorAll('.media-slider-slide');
                const prevBtn = slider.querySelector('[data-slider-prev]');
                const nextBtn = slider.querySelector('[data-slider-next]');

                let currentIndex = 0;
                const totalSlides = slides.length;

                function updateSlider() {
                    track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
                    if (prevBtn) prevBtn.disabled = currentIndex === 0;
                    if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;
                }

                function goNext() {
                    if (currentIndex < totalSlides - 1) { currentIndex++; updateSlider(); }
                }

                function goPrev() {
                    if (currentIndex > 0) { currentIndex--; updateSlider(); }
                }

                if (prevBtn) {
                    prevBtn.addEventListener('click', function (e) {
                        e.preventDefault(); e.stopPropagation(); goPrev();
                    });
                }
                if (nextBtn) {
                    nextBtn.addEventListener('click', function (e) {
                        e.preventDefault(); e.stopPropagation(); goNext();
                    });
                }

                let startX = 0, isDragging = false;
                track.addEventListener('touchstart', function (e) {
                    startX = e.touches[0].clientX; isDragging = true;
                }, { passive: true });
                track.addEventListener('touchend', function (e) {
                    if (!isDragging) return;
                    const endX = e.changedTouches[0].clientX;
                    const diff = startX - endX;
                    if (Math.abs(diff) > 50) {
                        if (diff > 0) goNext(); else goPrev();
                    }
                    isDragging = false;
                }, { passive: true });

                updateSlider();
            });
        }
    });
})();
