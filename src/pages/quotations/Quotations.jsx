import { useState, useMemo } from "react";
import {
  FileCheck,
  Plus,
  Search,
  Download,
  ChevronRight,
} from "lucide-react";
import { useCRM } from "../../context/CRMContext";
import { usePermissions } from "../../hooks/usePermissions";
import { TableSkeleton } from "../../components/common/Skeletons";
import SearchableSelect from "../../components/common/SearchableSelect";
import { QUOTATION_DOC_STATUS_CONFIG } from "../../config/crmStatuses";
import { formatDate } from "../../utils/dateUtils";
import { exportToCsv } from "../../utils/exportCsv";

export const Quotations = () => {
  const { quotations, createQuotation, updateQuotationStatus, leads, loading } = useCRM();
  const { canPerformAction } = usePermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // New Quotation Form state
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState("");
  const [paymentTerms] = useState("10% booking advance, balance against delivery invoice.");
  const [validDays] = useState(30);

  const filteredQuotes = useMemo(() => {
    return quotations.filter((q) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches =
          (q.quotation_number || "").toLowerCase().includes(query) ||
          (q.customer_name || "").toLowerCase().includes(query) ||
          (q.contact_person || "").toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (statusFilter !== "ALL" && q.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [quotations, searchTerm, statusFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const lead = leads.find((l) => String(l.id) === String(selectedLeadId));
    const priceNum = parseFloat(itemPrice) || 0;
    const qtyNum = parseInt(itemQty, 10) || 1;
    const subtotal = priceNum * qtyNum;
    const tax = subtotal * 0.18; // 18% GST standard on capital equipment
    const total = subtotal + tax;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + (parseInt(validDays, 10) || 30));

    await createQuotation({
      lead_id: lead ? lead.id : null,
      customer_id: lead ? lead.customer_id : null,
      customer_name: lead ? lead.customer_name : "Direct Quote Customer",
      contact_person: lead ? lead.contact_person : "-",
      phone: lead ? lead.phone : "-",
      state: lead ? lead.state : "",
      city: lead ? lead.city : "",
      items: [
        {
          item_id: `item-${Date.now()}`,
          description: itemDescription || lead?.equipment_interest || "Equipment Model",
          quantity: qtyNum,
          unit_price: priceNum,
          tax_percent: 18,
          total_price: total,
        },
      ],
      subtotal,
      tax_total: tax,
      grand_total: total,
      valid_until: validUntilDate.toISOString().slice(0, 10),
      payment_terms: paymentTerms,
    });

    setIsCreateModalOpen(false);
    setSelectedLeadId("");
    setItemDescription("");
    setItemPrice("");
  };

  const handleExport = () => {
    const data = filteredQuotes.map((q) => ({
      "Quotation No": q.quotation_number,
      Customer: q.customer_name,
      Contact: q.contact_person,
      Phone: q.phone,
      Subtotal: q.subtotal,
      Tax: q.tax_total,
      "Grand Total (INR)": q.grand_total,
      Status: q.status,
      "Valid Until": q.valid_until,
      Created: formatDate(q.created_at),
    }));
    exportToCsv(data, `quotations_export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-orange-600" />
            Equipment Quotations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate, review, and track official commercial price proposals and equipment proformas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canPerformAction("quotations:export") && (
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}

          {canPerformAction("quotations:create") && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Generate Quotation
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quote number, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="w-full">
            <SearchableSelect
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "draft", label: "Draft" },
                { value: "sent", label: "Sent" },
                { value: "negotiation", label: "Under Negotiation" },
                { value: "accepted", label: "Accepted" },
                { value: "rejected", label: "Rejected" },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val || "ALL")}
              placeholder="Filter by status..."
              isClearable={false}
            />
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Quotation #</th>
                <th className="py-3 px-4">Customer & Account</th>
                <th className="py-3 px-4">Equipment Proposal</th>
                <th className="py-3 px-4">Commercial Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <TableSkeleton rows={6} cols={7} />
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No quotations generated yet.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const statusConf = QUOTATION_DOC_STATUS_CONFIG[q.status] || {
                    label: q.status,
                    badgeClass: "bg-slate-500/10 text-slate-700 border-slate-200",
                  };

                  return (
                    <tr
                      key={q.id}
                      onClick={() => setSelectedQuotation(q)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {q.quotation_number}
                        <div className="text-[10px] text-slate-400 font-normal">
                          By {q.created_by_name || "Sales Operator"}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {q.customer_name}
                        </p>
                        <p className="text-[11px] text-slate-400">{q.contact_person}</p>
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {q.items?.[0]?.description || "Equipment"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Qty: {q.items?.[0]?.quantity || 1} unit(s)
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          ₹{q.grand_total?.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Incl. 18% GST (₹{q.tax_total?.toLocaleString("en-IN")})
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusConf.badgeClass}`}>
                          {statusConf.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        Until {q.valid_until}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Quotation Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setSelectedQuotation(null)}
          />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 text-xs p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {selectedQuotation.quotation_number}
                </h3>
                <p className="text-slate-400">Official Commercial Equipment Proforma</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuotation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 font-semibold">Customer</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {selectedQuotation.customer_name}
                </p>
                <p className="text-slate-500">{selectedQuotation.contact_person}</p>
                <p className="text-slate-500">{selectedQuotation.phone}</p>
              </div>

              <div>
                <p className="text-slate-400 font-semibold">Details</p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  Valid Until: {selectedQuotation.valid_until}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Location: {selectedQuotation.city}, {selectedQuotation.state}
                </p>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedQuotation.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right font-semibold">
                        ₹{item.total_price?.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Grand Total:</span>
              <span className="text-orange-600 dark:text-orange-400">
                ₹{selectedQuotation.grand_total?.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Status change buttons */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-slate-500 font-semibold">Update Status:</span>
              {["sent", "negotiation", "accepted", "rejected"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    updateQuotationStatus(selectedQuotation.id, st);
                    setSelectedQuotation((prev) => ({ ...prev, status: st }));
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                    selectedQuotation.status === st
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Quotation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 text-xs p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generate Equipment Quotation
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <SearchableSelect
                  label="Associate with Customer Lead"
                  placeholder="Select an active Lead..."
                  options={leads.map((l) => ({
                    value: l.id,
                    label: `${l.lead_code} - ${l.customer_name} (${l.city ? `${l.city}, ` : ""}${l.state})`,
                  }))}
                  value={selectedLeadId}
                  onChange={(val) => {
                    setSelectedLeadId(val || "");
                    const match = leads.find((l) => String(l.id) === String(val));
                    if (match) {
                      setItemDescription(match.model_name || match.equipment_interest || "");
                    }
                  }}
                  isClearable={false}
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Machine Model / Line Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Duty 3DX Backhoe Loader / Excavator"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Unit Price (INR Ex-Tax)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3400000"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-orange-700 dark:text-orange-400">Commercial Summary</p>
                <p className="mt-1">
                  Estimated Total: ₹
                  {((parseFloat(itemPrice) || 0) * (parseInt(itemQty, 10) || 1) * 1.18).toLocaleString("en-IN")}{" "}
                  (incl. 18% GST)
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Create and Issue Quotation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotations;
