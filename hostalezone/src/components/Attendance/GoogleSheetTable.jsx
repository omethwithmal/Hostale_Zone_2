import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GoogleSheetTable = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const rowsPerPage = 10;
  const navigate = useNavigate();

  const csvUrl =
    "https://docs.google.com/spreadsheets/d/1uRwGASIM-NbtGBtBKhDNsqRwhc_HCETgG15My3W_jQw/export?format=csv&gid=353363311";

  useEffect(() => {
    fetch(csvUrl)
      .then((res) => res.text())
      .then((csvText) => {
        const rows = csvText.split("\n").map((row) => row.split(","));
        const headers = rows[0];
        const jsonData = rows.slice(1).map((row) =>
          row.reduce((obj, value, i) => {
            obj[headers[i]] = value;
            return obj;
          }, {})
        );
        setData(jsonData);
      });
  }, []);

  const filteredData = data.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      val.toLowerCase().includes(search.toLowerCase())
    );

    let matchesAttendance = true;
    if (attendanceFilter === "in") {
      matchesAttendance = Object.values(item).some((val) =>
        val.toLowerCase().includes("in") || val.toLowerCase().includes("present")
      );
    } else if (attendanceFilter === "out") {
      matchesAttendance = Object.values(item).some((val) =>
        val.toLowerCase().includes("out") || val.toLowerCase().includes("absent")
      );
    }

    let matchesDate = true;
    if (dateFilter) {
      matchesDate = Object.values(item).some((val) => {
        if (typeof val === 'string' && val.includes('-')) {
          return val.split(' ')[0] === dateFilter;
        }
        return false;
      });
    }

    return matchesSearch && matchesAttendance && matchesDate;
  });

  const uniqueDates = [...new Set(data.map(item => {
    const dateValue = Object.values(item).find(val => 
      typeof val === 'string' && val.includes('-') && val.match(/\d{4}-\d{2}-\d{2}/)
    );
    return dateValue ? dateValue.split(' ')[0] : null;
  }).filter(date => date !== null))];

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIdx, startIdx + rowsPerPage);

  // Deep Blue Theme Styles
  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#e8eef5",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)",
      color: "white",
      padding: "30px 20px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      borderBottom: "3px solid #42a5f5",
    },
    heading: {
      fontSize: "32px",
      fontWeight: "bold",
      margin: "0",
      textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
    },
    subheading: {
      fontSize: "14px",
      marginTop: "8px",
      opacity: "0.95",
    },
    main: {
      padding: "30px",
      maxWidth: "1400px",
      margin: "0 auto",
    },
    controls: {
      display: "flex",
      gap: "15px",
      marginBottom: "25px",
      flexWrap: "wrap",
      justifyContent: "center",
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    downloadBtn: {
      padding: "10px 20px",
      background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
      color: "#fff",
      textDecoration: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      border: "none",
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    searchInput: {
      padding: "10px 15px",
      width: "250px",
      border: "2px solid #bbdef5",
      borderRadius: "8px",
      fontSize: "14px",
      transition: "border-color 0.2s",
      outline: "none",
    },
    select: {
      padding: "10px 15px",
      border: "2px solid #bbdef5",
      borderRadius: "8px",
      fontSize: "14px",
      cursor: "pointer",
      backgroundColor: "white",
      outline: "none",
    },
    resetBtn: {
      padding: "10px 20px",
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "#fff",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    th: {
      border: "1px solid #e3f2fd",
      padding: "14px",
      background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)",
      color: "#fff",
      textAlign: "left",
      fontWeight: "bold",
      fontSize: "14px",
    },
    td: {
      border: "1px solid #e3f2fd",
      padding: "12px",
      color: "#333",
      fontSize: "13px",
    },
    trAlt: {
      backgroundColor: "#f5f9ff",
    },
    pagination: {
      display: "flex",
      justifyContent: "center",
      gap: "8px",
      marginTop: "25px",
      flexWrap: "wrap",
    },
    pageButton: {
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#1565c0",
      color: "white",
      cursor: "pointer",
      transition: "all 0.2s",
      fontWeight: "bold",
    },
    pageButtonDisabled: {
      backgroundColor: "#90caf9",
      cursor: "not-allowed",
    },
    pageNumber: {
      padding: "8px 14px",
      borderRadius: "8px",
      border: "2px solid #1565c0",
      backgroundColor: "#fff",
      color: "#1565c0",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.2s",
    },
    activePage: {
      backgroundColor: "#0d47a1",
      color: "#fff",
      borderColor: "#0d47a1",
      transform: "scale(1.05)",
    },
    stats: {
      textAlign: "center",
      marginTop: "20px",
      color: "#1565c0",
      fontSize: "14px",
      fontWeight: "bold",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },
    filterLabel: {
      fontWeight: "bold",
      color: "#0d47a1",
      marginBottom: "5px",
      fontSize: "12px",
    },
  };

  const resetFilters = () => {
    setSearch("");
    setAttendanceFilter("all");
    setDateFilter("");
    setCurrentPage(1);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.heading}>Employee Attendance Dashboard</h1>
        <p style={styles.subheading}>Track and manage employee attendance records</p>
      </div>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Controls */}
        <div style={styles.controls}>
          <input
            type="text"
            placeholder="🔍 Search any field..."
            style={styles.searchInput}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            style={styles.select}
            value={attendanceFilter}
            onChange={(e) => {
              setAttendanceFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="in">In / Present</option>
            <option value="out">Out / Absent</option>
          </select>

          <select
            style={styles.select}
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value=""> All Dates</option>
            {uniqueDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))}
          </select>

          <a href={csvUrl} download="EmployeeAttendance.csv" style={styles.downloadBtn}>
            Download CSV
          </a>

          <button onClick={resetFilters} style={styles.resetBtn}>
            Reset Filters
          </button>
        </div>

        {/* Table */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                {data[0] &&
                  Object.keys(data[0]).map((key) => (
                    <th key={key} style={styles.th}>
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.trAlt : {}}>
                    {Object.values(row).map((val, j) => (
                      <td key={j} style={styles.td}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={data[0] ? Object.keys(data[0]).length : 1} style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <>
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                }}
              >
                ← Previous
              </button>

              {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 10 && currentPage > 5) {
                  pageNum = currentPage - 5 + i;
                  if (pageNum > totalPages) return null;
                }
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        ...styles.pageNumber,
                        ...(currentPage === pageNum ? styles.activePage : {}),
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.pageButton,
                  ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
                }}
              >
                Next →
              </button>
            </div>
            <div style={styles.stats}>
              Showing {startIdx + 1} to {Math.min(startIdx + rowsPerPage, filteredData.length)} of {filteredData.length} records
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default GoogleSheetTable;