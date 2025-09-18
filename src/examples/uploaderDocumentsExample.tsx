// Example: How to use getUploaderDocuments action
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getUploaderDocuments, resetUploaderDocuments } from '@/redux/actions/uploadActions';

const UploaderDocumentsExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.userLogin);
  const { loading, documents, totalCount, error } = useAppSelector(
    (state) => state.uploaderDocuments
  );

  useEffect(() => {
    if (userInfo && userInfo.role === 'uploader') {
      // Fetch documents for the current uploader
      dispatch(getUploaderDocuments(userInfo._id, 1, 10));
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetUploaderDocuments());
    };
  }, [dispatch, userInfo]);

  const handleRefresh = () => {
    if (userInfo) {
      dispatch(getUploaderDocuments(userInfo._id, 1, 10));
    }
  };

  const handleFilterByStatus = (status: string) => {
    if (userInfo) {
      dispatch(getUploaderDocuments(userInfo._id, 1, 10, status));
    }
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Uploader Documents ({totalCount || 0})</h2>
      
      <div>
        <button onClick={handleRefresh}>Refresh</button>
        <button onClick={() => handleFilterByStatus('pending')}>Pending</button>
        <button onClick={() => handleFilterByStatus('completed')}>Completed</button>
        <button onClick={() => handleFilterByStatus('')}>All</button>
      </div>

      {documents && documents.length > 0 ? (
        <ul>
          {documents.map((doc) => (
            <li key={doc._id}>
              <h3>{doc.title || doc.originalName}</h3>
              <p>Status: {doc.status}</p>
              <p>Signer: {doc.signerEmail}</p>
              <p>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No documents found</p>
      )}
    </div>
  );
};

export default UploaderDocumentsExample;
