import React from "react";

// Edit Paradox Form
export function EditParadoxForm({
  editParadoxForm,
  setEditParadoxForm,
  editingRefs,
  newRefKey,
  setNewRefKey,
  newRefValue,
  setNewRefValue,
}) {
  if (!editParadoxForm.visible) return null;
  return (
    <div
      className="paradox-edit-form"
      style={{
        position: "fixed",
        top: "5%",
        left: "50%",
        transform: "translate(-50%, -5%)",
        zIndex: 2000,
        background: "#fff",
        border: "1px solid #ccc",
        padding: "20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleEditParadoxSubmit();
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>Edit Paradox</h3>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}
          >
            Description:
          </label>
          <input
            type="text"
            value={editParadoxForm.description}
            onChange={(e) =>
              setEditParadoxForm((f) => ({ ...f, description: e.target.value }))
            }
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}
          >
            Group Name:
          </label>
          <input
            type="text"
            value={editParadoxForm.groupName}
            onChange={(e) =>
              setEditParadoxForm((f) => ({ ...f, groupName: e.target.value }))
            }
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            References:
          </label>
          {/* Existing refs */}
          {Object.entries(editingRefs).map(([key, refs]) => (
            <div
              key={key}
              style={{
                marginBottom: "12px",
                padding: "12px",
                border: "1px solid #eee",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <strong style={{ color: "#333" }}>{key}</strong>
                <button
                  type="button"
                  onClick={() => handleRemoveRefKey(key)}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Remove
                </button>
              </div>
              {/* Existing refs for this key */}
              {refs.map((ref, refIndex) => (
                <div
                  key={refIndex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      background: "#f5f5f5",
                      borderRadius: "4px",
                      marginRight: "8px",
                    }}
                  >
                    {ref}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRefFromKey(key, refIndex)}
                    style={{
                      background: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {/* Add new ref to this key */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="Add new reference (e.g., Matthew 14:25-33, John 14:9)"
                  value=""
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      handleAddRefToKey(key, e.target.value);
                      e.target.value = "";
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          ))}
          {/* Add new ref key */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              border: "1px dashed #ccc",
              borderRadius: "4px",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#666" }}>
              Add New Reference Category
            </h4>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="Category name..."
                value={newRefKey}
                onChange={(e) => setNewRefKey(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <input
                type="text"
                placeholder="First reference..."
                value={newRefValue}
                onChange={(e) => setNewRefValue(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <button
                type="button"
                onClick={handleAddRefKey}
                style={{
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          <button
            type="button"
            onClick={handleEditParadoxCancel}
            style={{
              background: "#f5f5f5",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

// Rename Paradox Form
export function RenameParadoxForm({ editingNode, editName, setEditName }) {
  if (!editingNode) return null;
  return (
    <div
      className="paradox-rename-form"
      style={{
        position: "fixed",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -30%)",
        zIndex: 2000,
        background: "#fff",
        border: "1px solid #ccc",
        padding: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: "8px",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRenameSubmit();
        }}
      >
        <div>
          <b>Rename Paradox</b>
        </div>
        <div style={{ margin: "8px 0" }}>
          <label>
            New Name:{" "}
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              style={{
                marginLeft: 8,
                padding: "4px 8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </label>
        </div>
        <div style={{ marginTop: 8 }}>
          <button
            type="submit"
            style={{
              background: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: "pointer",
              marginRight: "8px",
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleRenameCancel}
            style={{
              background: "#f5f5f5",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// New Paradox Form
export function NewParadoxForm({
  newParadoxForm,
  setNewParadoxForm,
  newParadoxRefs,
  newParadoxRefKey,
  setNewParadoxRefKey,
  newParadoxRefValue,
  setNewParadoxRefValue,
}) {
  if (!newParadoxForm.visible) return null;
  return (
    <div
      className="paradox-new-form"
      style={{
        position: "fixed",
        top: "5%",
        left: "50%",
        transform: "translate(-50%, -5%)",
        zIndex: 2000,
        background: "#fff",
        border: "1px solid #ccc",
        padding: "20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflow: "auto",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleNewParadoxSubmit();
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>
            Create New Paradox
          </h3>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}
          >
            Description:
          </label>
          <input
            type="text"
            value={newParadoxForm.description}
            onChange={(e) =>
              setNewParadoxForm((f) => ({ ...f, description: e.target.value }))
            }
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}
          >
            Group Name:
          </label>
          <input
            type="text"
            value={newParadoxForm.groupName}
            onChange={(e) =>
              setNewParadoxForm((f) => ({ ...f, groupName: e.target.value }))
            }
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            References:
          </label>
          {/* Existing refs */}
          {Object.entries(newParadoxRefs).map(([key, refs]) => (
            <div
              key={key}
              style={{
                marginBottom: "12px",
                padding: "12px",
                border: "1px solid #eee",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <strong style={{ color: "#333" }}>{key}</strong>
                <button
                  type="button"
                  onClick={() => handleRemoveNewParadoxRefKey(key)}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Remove
                </button>
              </div>
              {/* Existing refs for this key */}
              {refs.map((ref, refIndex) => (
                <div
                  key={refIndex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      padding: "4px 8px",
                      background: "#f5f5f5",
                      borderRadius: "4px",
                      marginRight: "8px",
                    }}
                  >
                    {ref}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveRefFromNewParadoxKey(key, refIndex)
                    }
                    style={{
                      background: "#ff9800",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {/* Add new ref to this key */}
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <input
                  type="text"
                  placeholder="Add new reference (e.g., Matthew 14:25-33, John 14:9)"
                  value=""
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      handleAddRefToNewParadoxKey(key, e.target.value);
                      e.target.value = "";
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          ))}
          {/* Add new ref key */}
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              border: "1px dashed #ccc",
              borderRadius: "4px",
            }}
          >
            <h4 style={{ margin: "0 0 8px 0", color: "#666" }}>
              Add New Reference Category
            </h4>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="Category name..."
                value={newParadoxRefKey}
                onChange={(e) => setNewParadoxRefKey(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <input
                type="text"
                placeholder="First reference..."
                value={newParadoxRefValue}
                onChange={(e) => setNewParadoxRefValue(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <button
                type="button"
                onClick={handleAddNewParadoxRefKey}
                style={{
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          <button
            type="button"
            onClick={handleNewParadoxCancel}
            style={{
              background: "#f5f5f5",
              color: "#333",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Create Paradox
          </button>
        </div>
      </form>
    </div>
  );
}
