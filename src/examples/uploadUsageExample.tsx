// Example usage of upload actions in React components
// This file demonstrates how to use the upload Redux actions

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  uploadDocument,
  getUploads,
  getUploadDetails,
  updateUpload,
  deleteUpload,
  assignSigner,
  signDocument,
  getPendingSignatures,
  getSignedDocuments,
  resetUploadDocument,
} from '@/redux/actions/uploadActions';

export const UploadUsageExample: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Accessing upload states from Redux
  const { loading: uploadLoading, upload, error: uploadError, progress } = useAppSelector(
    (state) => state.uploadDocument
  );
  const { loading: listLoading, uploads, totalCount } = useAppSelector(
    (state) => state.uploadsList
  );
  const { loading: detailsLoading, upload: uploadDetails } = useAppSelector(
    (state) => state.uploadDetails
  );
  const { documents: pendingDocs } = useAppSelector(
    (state) => state.pendingSignatures
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Example: Upload a document
  const handleFileUpload = async () => {
    if (selectedFile) {
      const signatureFields = [
        {
          type: 'signature',
          x: 100,
          y: 200,
          width: 200,
          height: 50,
          page: 1,
          required: true
        }
      ];

      await dispatch(uploadDocument(
        selectedFile,
        'Sample Contract Document', // title
        'jane@example.com', // signerEmail
        signatureFields // signature field positions
      ));
    }
  };

  // Example: Get uploads list
  const loadUploads = async () => {
    await dispatch(getUploads(1, 10, 'uploaded')); // page, limit, status
  };

  // Example: Get upload details
  const loadUploadDetails = async (uploadId: string) => {
    await dispatch(getUploadDetails(uploadId));
  };

  // Example: Update upload
  const updateUploadDetails = async (uploadId: string) => {
    await dispatch(updateUpload(uploadId, {
      priority: 'urgent',
      dueDate: '2025-01-25',
      comments: 'Updated comments',
    }));
  };

  // Example: Delete upload
  const removeUpload = async (uploadId: string) => {
    await dispatch(deleteUpload(uploadId));
  };

  // Example: Assign signer
  const assignDocumentSigner = async (uploadId: string, signerId: string) => {
    await dispatch(assignSigner(uploadId, signerId, '2025-01-28'));
  };

  // Example: Sign document
  const signUploadedDocument = async (uploadId: string) => {
    await dispatch(signDocument(uploadId, {
      signatureImage: 'base64-signature-data',
      comments: 'Document approved and signed',
    }));
  };

  // Example: Load pending signatures (for signers)
  const loadPendingSignatures = async () => {
    await dispatch(getPendingSignatures());
  };

  // Example: Load signed documents
  const loadSignedDocuments = async () => {
    await dispatch(getSignedDocuments());
  };

  // Example: Reset upload state
  const resetUpload = () => {
    dispatch(resetUploadDocument());
  };

  // Load data on component mount
  useEffect(() => {
    loadUploads();
    loadPendingSignatures();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Management Example</h2>
      
      {/* File Upload Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="mb-2"
        />
        <button
          onClick={handleFileUpload}
          disabled={!selectedFile || uploadLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploadLoading ? `Uploading... ${progress}%` : 'Upload Document'}
        </button>
        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
      </div>

      {/* Uploads List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Uploads List</h3>
        {listLoading ? (
          <p>Loading uploads...</p>
        ) : (
          <div>
            <p>Total uploads: {totalCount}</p>
            <ul className="list-disc pl-5">
              {uploads?.map((upload) => (
                <li key={upload._id} className="mb-2">
                  {upload.originalName} - Status: {upload.status}
                  <button
                    onClick={() => loadUploadDetails(upload._id)}
                    className="ml-2 text-blue-500 underline"
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pending Signatures */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Pending Signatures</h3>
        <ul className="list-disc pl-5">
          {pendingDocs?.map((doc) => (
            <li key={doc._id} className="mb-2">
              {doc.originalName} - Priority: {doc.priority}
              <button
                onClick={() => signUploadedDocument(doc._id)}
                className="ml-2 bg-green-500 text-white px-2 py-1 rounded"
              >
                Sign
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Upload Details */}
      {uploadDetails && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Upload Details</h3>
          <p>File: {uploadDetails.originalName}</p>
          <p>Status: {uploadDetails.status}</p>
          <p>Priority: {uploadDetails.priority}</p>
          <p>Uploaded by: {uploadDetails.uploadedBy.name}</p>
          {uploadDetails.assignedTo && (
            <p>Assigned to: {uploadDetails.assignedTo.name}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Usage in a component:
/*
import { UploadUsageExample } from '@/examples/uploadUsageExample';

// In your component:
<UploadUsageExample />
*/
