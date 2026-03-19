import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Upload } from 'lucide-react';
import { getInterviewParentTypes, getInterviewTests, getInterviewTestsByParentType } from '../../../services/interviewService';
import { uploadInterviewThumbnail } from '../../../services/adminService';
import { ROUTES } from '../../../constants/routerConstants';
import type { InterviewTest, ParentInterviewType } from '../../../types/interviewTest';
import './InterviewThumbnails.css';

const FETCH_LIMIT = 100; // backend clamps to 100

export default function AdminInterviewThumbnails() {
  const [parentTypes, setParentTypes] = useState<ParentInterviewType[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [tests, setTests] = useState<InterviewTest[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadParentTypes = useCallback(async () => {
    try {
      const list = await getInterviewParentTypes();
      setParentTypes(list);
    } catch {
      setParentTypes([]);
    }
  }, []);

  const fetchAllTests = useCallback(
    async (parentTypeId: string | null): Promise<InterviewTest[]> => {
      let page = 1;
      let totalPages = 1;
      const items: InterviewTest[] = [];

      while (page <= totalPages) {
        const res = parentTypeId
          ? await getInterviewTestsByParentType(parentTypeId, { page, limit: FETCH_LIMIT })
          : await getInterviewTests({ page, limit: FETCH_LIMIT });

        totalPages = res.totalPages ?? 1;
        items.push(...res.data);
        page += 1;
      }

      return items;
    },
    []
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllTests(selectedParentId);
      setTests(list);
    } catch {
      setError('Could not load interviews.');
    } finally {
      setLoading(false);
    }
  }, [fetchAllTests, selectedParentId]);

  useEffect(() => {
    void loadParentTypes();
  }, [loadParentTypes]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const pills = useMemo(() => {
    return [{ id: null as string | null, label: 'All' }, ...parentTypes.map((p) => ({ id: p.id, label: p.title }))];
  }, [parentTypes]);

  const handleUpload = useCallback(
    async (interviewTestId: string, file: File) => {
      setUploadingId(interviewTestId);
      try {
        await uploadInterviewThumbnail(interviewTestId, file);
        await refresh();
      } catch {
        alert('Upload failed.');
      } finally {
        setUploadingId(null);
      }
    },
    [refresh]
  );

  return (
    <div className="admin-interview-thumbnails">
      <div className="admin-interview-thumbnails__inner">
        <header className="admin-interview-thumbnails__header">
          <div>
            <h1 className="admin-interview-thumbnails__title">Interview thumbnails</h1>
            <p className="admin-interview-thumbnails__subtitle">Upload/replace thumbnails used on the interview cards</p>
          </div>
          <div className="admin-interview-thumbnails__actions">
            <button
              type="button"
              className="admin-interview-thumbnails__btn-secondary"
              onClick={() => void refresh()}
              disabled={loading}
            >
              <RefreshCw aria-hidden />
              Refresh
            </button>
          </div>
        </header>

        <div className="admin-interview-thumbnails__toolbar">
          <div className="admin-interview-thumbnails__filters" role="tablist" aria-label="Interview categories">
            {pills.map((p) => (
              <button
                key={p.id ?? 'all'}
                type="button"
                onClick={() => setSelectedParentId(p.id)}
                className={`admin-interview-thumbnails__pill ${
                  selectedParentId === p.id ? 'admin-interview-thumbnails__pill--active' : ''
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="admin-interview-thumbnails__error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-interview-thumbnails__loading">Loading…</div>
        ) : (
          <div className="admin-interview-thumbnails__table-wrap">
            <table className="admin-interview-thumbnails__table">
              <thead>
                <tr>
                  <th>Interview</th>
                  <th>Thumbnail</th>
                  <th>Upload</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t.id}>
                    <td className="admin-interview-thumbnails__cell-name">
                      {t.title}
                      <span className="admin-interview-thumbnails__cell-id">{t.parent?.title ?? ''}</span>
                    </td>
                    <td>
                      {t.thumbnailUrl ? (
                        <img className="admin-interview-thumbnails__thumb" src={t.thumbnailUrl} alt={`${t.title} thumbnail`} />
                      ) : (
                        <span className="admin-interview-thumbnails__no-thumb">No thumbnail</span>
                      )}
                    </td>
                    <td>
                      <label className="admin-interview-thumbnails__upload">
                        <Upload aria-hidden />
                        <span>{uploadingId === t.id ? 'Uploading…' : 'Choose file'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          disabled={uploadingId === t.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void handleUpload(t.id, file);
                            // reset so selecting same file again triggers onChange
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to={ROUTES.ADMIN_DASHBOARD} className="admin-interview-thumbnails__back">
          ← Back to admin dashboard
        </Link>
      </div>
    </div>
  );
}

