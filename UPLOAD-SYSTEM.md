# Upload System Documentation

## Overview
The upload system provides comprehensive document management functionality including file uploads, signer assignment, document signing, and status tracking.

## Redux Structure

### Constants (`src/redux/constants/uploadConstants.ts`)
```typescript
// Document lifecycle constants
UPLOAD_DOCUMENT_*     // File upload operations
GET_UPLOADS_*         // List uploads with pagination
GET_UPLOAD_DETAILS_*  // Single upload details
UPDATE_UPLOAD_*       // Modify upload metadata
DELETE_UPLOAD_*       // Remove uploads

// Workflow constants
ASSIGN_SIGNER_*       // Assign documents to signers
SIGN_DOCUMENT_*       // Sign documents
GET_PENDING_SIGNATURES_*  // Documents awaiting signature
GET_SIGNED_DOCUMENTS_*    // Completed documents

// Progress tracking
UPLOAD_PROGRESS_*     // Real-time upload progress
```

### State Structure

#### Upload Interface
```typescript
interface Upload {
  _id: string;
  fileName: string;        // Generated filename
  originalName: string;    // User's original filename
  fileSize: number;        // File size in bytes
  fileType: string;        // MIME type
  filePath: string;        // Server file path
  uploadedBy: User;        // Uploader details
  assignedTo?: User;       // Assigned signer
  status: 'uploaded' | 'assigned' | 'signed' | 'completed' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueDate?: string;        // Signing deadline
  signedAt?: string;       // Signature timestamp
  signatureData?: {        // Signature details
    signedBy: string;
    signedAt: string;
    signatureImage?: string;
  };
  comments?: string;       // Additional notes
  createdAt: string;
  updatedAt: string;
}
```

### Reducers (`src/redux/reducers/uploadReducers.ts`)

#### Available States
1. **uploadDocument** - File upload state with progress
2. **uploadsList** - Paginated uploads list
3. **uploadDetails** - Single upload details
4. **updateUpload** - Upload modification state
5. **deleteUpload** - Upload deletion state
6. **assignSigner** - Signer assignment state
7. **signDocument** - Document signing state
8. **pendingSignatures** - Documents awaiting signature
9. **signedDocuments** - Completed documents
10. **uploadProgress** - Real-time upload progress

### Actions (`src/redux/actions/uploadActions.ts`)

#### Core Actions

**Upload Document**
```typescript
uploadDocument(
  file: File,
  title: string,
  signerEmail: string,
  signatureFields: Array<{
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
    required: boolean;
  }> = []
)
```

**Get Uploads List**
```typescript
getUploads(
  page: number = 1,
  limit: number = 10,
  status?: string
)
```

**Get Upload Details**
```typescript
getUploadDetails(uploadId: string)
```

**Update Upload**
```typescript
updateUpload(uploadId: string, {
  assignedTo?: string;
  priority?: string;
  dueDate?: string;
  comments?: string;
  status?: string;
})
```

**Delete Upload**
```typescript
deleteUpload(uploadId: string)
```

#### Workflow Actions

**Assign Signer**
```typescript
assignSigner(
  uploadId: string,
  signerId: string,
  dueDate?: string
)
```

**Sign Document**
```typescript
signDocument(uploadId: string, {
  signatureImage?: string;
  comments?: string;
})
```

**Get Pending Signatures**
```typescript
getPendingSignatures() // For signers
```

**Get Signed Documents**
```typescript
getSignedDocuments() // Historical records
```

## API Endpoints

The actions expect the following API endpoints:

### Upload Management
- `POST /api/documents/upload` - Upload new document
- `GET /api/documents?page=1&limit=10&status=uploaded` - List documents
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Workflow
- `PUT /api/uploads/:id/assign` - Assign signer
- `POST /api/uploads/:id/sign` - Sign document
- `GET /api/uploads/pending-signatures` - Get pending signatures
- `GET /api/uploads/signed-documents` - Get signed documents

## Usage Examples

### Basic Upload
```typescript
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { uploadDocument } from '@/redux/actions/uploadActions';

const dispatch = useAppDispatch();
const { loading, progress, error } = useAppSelector(state => state.uploadDocument);

const handleUpload = async (file: File) => {
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
    file,
    'Sample Contract Document',
    'jane@example.com',
    signatureFields
  ));
};
```

### List Uploads
```typescript
const { uploads, loading, totalCount } = useAppSelector(state => state.uploadsList);

useEffect(() => {
  dispatch(getUploads(1, 10, 'uploaded'));
}, []);
```

### Sign Document
```typescript
const handleSign = async (uploadId: string) => {
  await dispatch(signDocument(uploadId, {
    signatureImage: 'base64-signature-data',
    comments: 'Approved and signed'
  }));
};
```

### Track Progress
```typescript
const { progress, uploading } = useAppSelector(state => state.uploadProgress);

// Progress is updated automatically during upload
// Use in progress bars: <progress value={progress} max={100} />
```

## Integration with Components

### Uploader Dashboard
- Use `uploadDocument` for file uploads
- Use `getUploads` to display user's uploads
- Use `assignSigner` to assign documents
- Track progress with `uploadProgress`

### Signer Dashboard
- Use `getPendingSignatures` for documents to sign
- Use `signDocument` for signing
- Use `getSignedDocuments` for history

### Admin Dashboard
- Use `getUploads` with different filters
- Use `updateUpload` for administrative changes
- Use `deleteUpload` for cleanup

## Error Handling

All actions include proper error handling:
```typescript
const { error } = useAppSelector(state => state.uploadDocument);

if (error) {
  // Display error message to user
  console.error('Upload failed:', error);
}
```

## Best Practices

1. **Reset States**: Use reset actions when navigating away
2. **Progress Tracking**: Always show upload progress for better UX
3. **Error Feedback**: Display meaningful error messages
4. **Optimistic Updates**: Update UI immediately, handle errors gracefully
5. **Pagination**: Use pagination for large upload lists
6. **File Validation**: Validate files before uploading

## File Upload Configuration

The upload system supports:
- **File Types**: PDF, DOC, DOCX, images (configurable on backend)
- **File Size**: Maximum size limits (configurable on backend)
- **Progress Tracking**: Real-time upload progress
- **Error Recovery**: Automatic retry mechanisms (can be implemented)

## Security Considerations

- File type validation
- File size limits
- User permission checks
- Secure file storage
- Access control for documents
- Audit trail for all actions

This upload system provides a complete document management solution with role-based access control and comprehensive state management.
