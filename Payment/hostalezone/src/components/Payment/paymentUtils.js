export const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return `LKR ${value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDisplayDate = (dateValue) => {
  if (!dateValue) {
    return "Not available";
  }

  try {
    return new Date(dateValue).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "Not available";
  }
};

export const getCurrentBillMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const getBillStatusClasses = (status = "") => {
  const normalized = status.toLowerCase();

  if (normalized === "paid") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (normalized === "overdue") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (normalized === "partially_paid") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (normalized === "cancelled") {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }

  return "bg-blue-100 text-blue-700 border-blue-200";
};

export const getPaymentStatusClasses = (status = "") => {
  const normalized = status.toLowerCase();

  if (normalized === "accepted") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (normalized === "rejected") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (normalized === "cancelled") {
    return "bg-gray-100 text-gray-700 border-gray-200";
  }

  if (normalized === "otp_sent") {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
};

export const getGradientByIndex = (index = 0) => {
  const gradients = [
    "from-blue-500 to-blue-600",
    "from-indigo-500 to-indigo-600",
    "from-cyan-500 to-cyan-600",
    "from-sky-500 to-sky-600",
  ];

  return gradients[index % gradients.length];
};

export const parseAdditionalFeesText = (textValue = "") =>
  textValue
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart, amountPart] = line.split(":");
      return {
        label: String(labelPart || "").trim(),
        amount: Number(amountPart || 0),
      };
    })
    .filter((item) => item.label && Number.isFinite(item.amount));

export const stringifyAdditionalFees = (fees = []) =>
  (fees || [])
    .map((fee) => `${fee.label}: ${fee.amount}`)
    .join("\n");

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
