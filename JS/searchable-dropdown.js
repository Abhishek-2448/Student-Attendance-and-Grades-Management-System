/* Reusable searchable student selector. The hidden select remains the source of truth for existing form/filter logic. */
(function () {
  class SearchableDropdown {
    constructor({ input, select, list, allowAll = false, allLabel = "All Students" }) {
      this.input = input;
      this.select = select;
      this.list = list;
      this.allowAll = allowAll;
      this.allLabel = allLabel;
      this.items = [];
      this.activeIndex = -1;

      this.input.addEventListener("input", () => {
        this.select.value = "";
        this.activeIndex = -1;
        this.render(this.input.value);
        this.open();
        this.select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      this.input.addEventListener("focus", () => {
        this.render(this.input.value);
        this.open();
      });
      this.input.addEventListener("keydown", (event) => this.handleKeydown(event));
      document.addEventListener("click", (event) => {
        if (!this.input.parentElement.contains(event.target)) this.close();
      });
    }

    setItems(items) {
      const selected = this.select.value;
      this.items = items.map((item) => ({
        value: String(item.id),
        label: String(item.name || ""),
        search: String(item.name || "").toLowerCase()
      }));
      this.select.innerHTML = "";
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = this.allowAll ? this.allLabel : "Select Student";
      this.select.appendChild(defaultOption);
      this.items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        this.select.appendChild(option);
      });
      this.select.value = selected;
      this.input.value = selected
        ? (this.items.find((item) => item.value === selected)?.label || "")
        : "";
      this.render("");
    }

    render(query) {
      this.list.innerHTML = "";
      const normalized = query.trim().toLowerCase();
      if (this.allowAll) this.addOption("", this.allLabel, !normalized);
      const matches = this.items.filter((item) => !normalized || item.search.includes(normalized));
      matches.slice(0, 50).forEach((item) => this.addOption(item.value, item.label, false));
      if (!matches.length && !(this.allowAll && !normalized)) {
        const empty = document.createElement("li");
        empty.className = "searchable-empty";
        empty.textContent = "No students found";
        this.list.appendChild(empty);
      }
    }

    addOption(value, label, isDefault) {
      const li = document.createElement("li");
      li.className = "searchable-option";
      li.textContent = label;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(this.select.value === value));
      if (isDefault) li.classList.add("default-option");
      li.addEventListener("mousedown", (event) => event.preventDefault());
      li.addEventListener("click", () => this.choose(value, label));
      this.list.appendChild(li);
    }

    choose(value, label) {
      this.select.value = value;
      this.input.value = value ? label : "";
      this.select.dispatchEvent(new Event("change", { bubbles: true }));
      this.close();
    }

    handleKeydown(event) {
      const options = Array.from(this.list.querySelectorAll(".searchable-option"));
      if (event.key === "Escape") { this.close(); return; }
      if (event.key === "ArrowDown" && options.length) {
        event.preventDefault(); this.activeIndex = Math.min(this.activeIndex + 1, options.length - 1);
      } else if (event.key === "ArrowUp" && options.length) {
        event.preventDefault(); this.activeIndex = Math.max(this.activeIndex - 1, 0);
      } else if (event.key === "Enter" && options.length) {
        event.preventDefault(); options[this.activeIndex < 0 ? 0 : this.activeIndex].click(); return;
      } else return;
      options.forEach((option, index) => option.classList.toggle("active", index === this.activeIndex));
      options[this.activeIndex]?.scrollIntoView({ block: "nearest" });
    }

    open() {
      this.list.hidden = false;
      this.input.setAttribute("aria-expanded", "true");
    }

    close() {
      this.list.hidden = true;
      this.input.setAttribute("aria-expanded", "false");
      this.activeIndex = -1;
    }
  }
  window.SearchableDropdown = SearchableDropdown;
})();
