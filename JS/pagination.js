
const PAGE_SIZE = 50;


function getPageItems(items, page, pageSize = PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page: currentPage,
    totalPages,
    total,
    startIndex,
    endIndex: Math.min(startIndex + pageSize, total),
  };
}

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const windowSize = 1;

  for (let page = 1; page <= totalPages; page++) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= windowSize;

    if (isEdge || isNearCurrent) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return pages;
}


function renderPagination(container, pageInfo, onPageChange, pageSize = PAGE_SIZE) {
  if (!container) return;

  container.innerHTML = "";

  if (pageInfo.total <= pageSize) {
    container.hidden = true;
    return;
  }

  container.hidden = false;

  const summary = document.createElement("span");
  summary.className = "pagination-summary";
  summary.textContent = `Showing ${pageInfo.startIndex + 1}-${pageInfo.endIndex} of ${pageInfo.total}`;

  const controls = document.createElement("div");
  controls.className = "pagination-controls";

  function makeButton(label, page, options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pagination-button";
    button.textContent = label;

    if (options.ariaLabel) {
      button.setAttribute("aria-label", options.ariaLabel);
    }

    if (options.active) {
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
    }

    if (options.disabled) {
      button.disabled = true;
    } else {
      button.addEventListener("click", () => onPageChange(page));
    }

    return button;
  }

  controls.appendChild(
    makeButton("Prev", pageInfo.page - 1, {
      disabled: pageInfo.page === 1,
      ariaLabel: "Previous page",
    }),
  );

  getPageNumbers(pageInfo.page, pageInfo.totalPages).forEach((entry) => {
    if (entry === "...") {
      const gap = document.createElement("span");
      gap.className = "pagination-gap";
      gap.textContent = "...";
      controls.appendChild(gap);
      return;
    }

    controls.appendChild(
      makeButton(String(entry), entry, { active: entry === pageInfo.page }),
    );
  });

  controls.appendChild(
    makeButton("Next", pageInfo.page + 1, {
      disabled: pageInfo.page === pageInfo.totalPages,
      ariaLabel: "Next page",
    }),
  );

  container.append(summary, controls);
}
