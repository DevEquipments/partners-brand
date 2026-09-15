/**
 * Shared CSV export utility.
 * Properly escapes fields with commas, quotes, and newlines.
 */

export const exportToCsv = (filename, columns, rows) => {
  if (!rows || rows.length === 0) {
    return false;
  }

  const headers = columns.map((col) => `"${(col.label || col.key).replace(/"/g, '""')}"`);

  const csvRows = rows.map((row) => {
    return columns
      .map((col) => {
        let val;
        if (typeof col.transform === "function") {
          val = col.transform(row[col.key], row);
        } else {
          val = row[col.key];
        }
        if (val === null || val === undefined) {
          return '""';
        }
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(",");
  });

  const csvContent = [headers.join(","), ...csvRows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const downloadName = filename.endsWith(".csv") ? filename : `${filename}_${Date.now()}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", downloadName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};
