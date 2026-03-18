import React from "react";

export default function ConfirmModal({ id, title, body, confirmText = "Confirm", onConfirm }) {
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div className="modal-body">{body}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-light" data-bs-dismiss="modal">
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              data-bs-dismiss="modal"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

