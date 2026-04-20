import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaCheck, FaEnvelope, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../lib/useAuth';
import {
  deleteAdminContactMessage,
  getAdminContactMessages,
  markAdminContactMessageRead,
  markAllAdminContactMessagesRead,
} from '../../../lib/contactMessages';

const getRouteFilter = (tab) => {
  if (tab === 'unread') {
    return 'UNREAD';
  }

  return 'ALL';
};

const formatDate = (value) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const AdminMessagesPanel = () => {
  const { user, token } = useAuth();
  const { tab } = useParams();
  const isAdmin = user?.role === 'ADMIN';

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const routeFilter = getRouteFilter(tab);

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      if (!isAdmin || !token) {
        if (isMounted) {
          setMessages([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setFetchError('');

      try {
        const payload = await getAdminContactMessages(token);
        if (isMounted) {
          setMessages(payload);
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(error?.message || 'Unable to load contact messages.');
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, token]);

  const summary = useMemo(
    () => ({
      total: messages.length,
      unread: messages.filter((entry) => !entry.read).length,
    }),
    [messages]
  );

  const filteredMessages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return messages.filter((entry) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        entry.fullName.toLowerCase().includes(normalizedSearch) ||
        entry.email.toLowerCase().includes(normalizedSearch) ||
        entry.subject.toLowerCase().includes(normalizedSearch) ||
        entry.message.toLowerCase().includes(normalizedSearch);

      if (routeFilter === 'UNREAD') {
        return matchesSearch && !entry.read;
      }

      return matchesSearch;
    });
  }, [messages, searchTerm, routeFilter]);

  const handleMarkRead = async (messageId) => {
    if (!token) {
      setActionError('Your session has expired. Please login again.');
      return;
    }

    setActionError('');

    try {
      const updated = await markAdminContactMessageRead(token, messageId);
      setMessages((current) =>
        current.map((entry) => (entry.messageId === messageId ? updated : entry))
      );
    } catch (error) {
      setActionError(error?.message || 'Unable to mark message as read.');
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) {
      setActionError('Your session has expired. Please login again.');
      return;
    }

    setActionError('');

    try {
      const updated = await markAllAdminContactMessagesRead(token);
      setMessages(updated);
    } catch (error) {
      setActionError(error?.message || 'Unable to mark all messages as read.');
    }
  };

  const handleDelete = async (messageId) => {
    if (!token) {
      setActionError('Your session has expired. Please login again.');
      return;
    }

    setActionError('');

    try {
      await deleteAdminContactMessage(token, messageId);
      setMessages((current) => current.filter((entry) => entry.messageId !== messageId));
    } catch (error) {
      setActionError(error?.message || 'Unable to delete message.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800">Messages</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only users with the ADMIN role can view contact messages.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Contact-us inquiries sent by visitors.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Mark All as Read
        </button>
      </div>

      {fetchError ? (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 text-sm text-red-700">
          {fetchError}
        </div>
      ) : null}

      {actionError ? (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Total Messages</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Unread</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{summary.unread}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name, email, subject, or message"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-500">
          Loading messages...
        </div>
      ) : null}

      {!isLoading && filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-500">
          No messages found.
        </div>
      ) : null}

      {!isLoading ? (
        <div className="space-y-3">
          {filteredMessages.map((entry) => (
            <article
              key={entry.id}
              className={`bg-white rounded-xl border shadow-sm p-4 ${
                entry.read ? 'border-gray-100' : 'border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                  <FaEnvelope size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{entry.subject}</h3>
                    {!entry.read ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Unread
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">{entry.fullName}</span> ({entry.email})
                  </p>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{entry.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(entry.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!entry.read ? (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(entry.messageId)}
                      className="px-2 py-1 rounded-md text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 inline-flex items-center gap-1"
                    >
                      <FaCheck size={10} />
                      Mark Read
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.messageId)}
                    className="px-2 py-1 rounded-md text-xs bg-red-100 hover:bg-red-200 text-red-700 inline-flex items-center gap-1"
                  >
                    <FaTrash size={10} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default AdminMessagesPanel;
