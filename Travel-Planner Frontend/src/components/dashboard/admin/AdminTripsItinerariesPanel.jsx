import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../../lib/useAuth';
import { formatInr, getTourPricePerTraveler } from '../../../lib/pricing';
import {
  createTourInCatalog,
  deleteTourFromCatalog,
  updateTourInCatalog,
  useToursCatalog,
} from '../../../lib/toursCatalog';

const categoryOptions = ['Family', 'Couple', 'Adventure', 'Culture'];

const emptyTourForm = {
  destination: '',
  country: '',
  category: 'Adventure',
  duration: 5,
  pricePerTraveler: '',
  description: '',
  img: '',
  planText: '',
};

const getTourSlug = (tour) => tour.destination.toLowerCase().replace(/\s/g, '-');

const getCategoryFromRoute = (tab) => {
  if (tab === 'family') {
    return 'Family';
  }

  if (tab === 'couple') {
    return 'Couple';
  }

  if (tab === 'adventure') {
    return 'Adventure';
  }

  if (tab === 'culture') {
    return 'Culture';
  }

  return 'All';
};

const mapTourToForm = (tour) => ({
  destination: tour.destination,
  country: tour.country,
  category: tour.category,
  duration: tour.duration,
  pricePerTraveler:
    Number.isFinite(Number(tour.pricePerTraveler)) && Number(tour.pricePerTraveler) > 0
      ? String(tour.pricePerTraveler)
      : '',
  description: tour.description,
  img: tour.img,
  planText: Array.isArray(tour.plan) ? tour.plan.join('\n') : '',
});

const parsePlanText = (text) =>
  String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const AdminTripsItinerariesPanel = () => {
  const { user, token } = useAuth();
  const { tab } = useParams();
  const isAdmin = user?.role === 'ADMIN';

  const tours = useToursCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedTourId, setSelectedTourId] = useState('');
  const [editorMode, setEditorMode] = useState('view');
  const [tourForm, setTourForm] = useState(emptyTourForm);
  const [saveMessage, setSaveMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const routeCategory = getCategoryFromRoute(tab);
  const activeCategoryFilter = routeCategory === 'All' ? categoryFilter : routeCategory;

  const summary = useMemo(() => {
    const totalTours = tours.length;
    const totalDays = tours.reduce((sum, entry) => sum + Number(entry.duration || 0), 0);
    const averageDuration = totalTours > 0 ? (totalDays / totalTours).toFixed(1) : '0.0';
    const uniqueCountries = new Set(tours.map((entry) => entry.country)).size;
    const categories = new Set(tours.map((entry) => entry.category)).size;

    return {
      totalTours,
      uniqueCountries,
      categories,
      averageDuration,
    };
  }, [tours]);

  const filteredTours = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tours.filter((entry) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        entry.destination.toLowerCase().includes(normalizedSearch) ||
        entry.country.toLowerCase().includes(normalizedSearch) ||
        entry.category.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        activeCategoryFilter === 'All' || entry.category === activeCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [tours, searchTerm, activeCategoryFilter]);

  useEffect(() => {
    if (filteredTours.length === 0) {
      setSelectedTourId('');
      return;
    }

    const selectedExists = filteredTours.some((entry) => entry.id === selectedTourId);
    if (!selectedTourId || !selectedExists) {
      setSelectedTourId(filteredTours[0].id);
    }
  }, [filteredTours, selectedTourId]);

  const selectedTour = useMemo(
    () => filteredTours.find((entry) => entry.id === selectedTourId) || null,
    [filteredTours, selectedTourId]
  );

  const setFormField = (key, value) => {
    setTourForm((current) => ({ ...current, [key]: value }));
  };

  const startCreateTour = () => {
    setEditorMode('create');
    setTourForm({
      ...emptyTourForm,
      category: routeCategory === 'All' ? 'Adventure' : routeCategory,
    });
    setSaveMessage('');
  };

  const startEditTour = () => {
    if (!selectedTour) {
      return;
    }

    setEditorMode('edit');
    setTourForm(mapTourToForm(selectedTour));
    setSaveMessage('');
  };

  const cancelEditor = () => {
    setEditorMode('view');
    setTourForm(emptyTourForm);
  };

  const handleSave = () => {
    const destination = tourForm.destination.trim();
    const country = tourForm.country.trim();
    const description = tourForm.description.trim();
    const category = tourForm.category.trim();
    const img = tourForm.img.trim();
    const duration = Math.max(1, Number(tourForm.duration) || 1);
    const parsedPrice = Number(tourForm.pricePerTraveler);
    const pricePerTraveler =
      Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : null;
    const plan = parsePlanText(tourForm.planText);

    if (!destination || !country || !description || !img) {
      setSaveMessage('Please fill destination, country, description, and image URL.');
      return;
    }

    if (!categoryOptions.includes(category)) {
      setSaveMessage('Please select a valid category.');
      return;
    }

    if (plan.length === 0) {
      setSaveMessage('Please provide itinerary lines (one day per line).');
      return;
    }

    const payload = {
      destination,
      country,
      category,
      duration,
      pricePerTraveler,
      description,
      img,
      plan,
    };

    if (editorMode === 'create') {
      const createdTour = createTourInCatalog(payload);
      setSelectedTourId(createdTour.id);
      setSaveMessage('New trip created successfully.');
    }

    if (editorMode === 'edit' && selectedTour) {
      updateTourInCatalog(selectedTour.id, payload);
      setSaveMessage('Trip updated successfully.');
    }

    setEditorMode('view');
  };

  const handleDeleteSelected = async () => {
    if (!selectedTour || !token) {
      return;
    }

    const isConfirmed = window.confirm(
      `Delete "${selectedTour.destination}, ${selectedTour.country}" from tours?`
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);
    setSaveMessage('');

    try {
      const deletedTourId = selectedTour.id;
      const updatedTours = await deleteTourFromCatalog(deletedTourId, token);
      setSaveMessage('Trip deleted successfully.');
      setEditorMode('view');

      if (updatedTours.length === 0) {
        setSelectedTourId('');
      } else if (selectedTourId === deletedTourId) {
        setSelectedTourId(updatedTours[0].id);
      }
    } catch (error) {
      setSaveMessage(error?.message || 'Unable to delete selected trip.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800">Trips & Itineraries</h3>
        <p className="text-sm text-gray-500 mt-2">
          Only users with the ADMIN role can manage tours and itineraries.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Trips & Itineraries</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit existing tours or add a new trip. Changes sync across the project.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startCreateTour}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Add New Trip
          </button>
          <button
            type="button"
            onClick={startEditTour}
            disabled={!selectedTour}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Edit Selected
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={!selectedTour || editorMode !== 'view' || isDeleting}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Total Tours</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalTours}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Countries</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{summary.uniqueCountries}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Categories</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{summary.categories}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Avg Duration</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{summary.averageDuration} days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 min-w-0">
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search destination, country, category"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              disabled={routeCategory !== 'All'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="All">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredTours.map((tour) => {
              const isActive = selectedTour && selectedTour.id === tour.id;

              return (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => setSelectedTourId(tour.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{tour.destination}</p>
                      <p className="text-xs text-gray-500">{tour.country}</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {tour.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{tour.duration} days itinerary</p>
                </button>
              );
            })}
            {filteredTours.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No tours found for your filter.
              </p>
            ) : null}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 min-w-0">
          {editorMode === 'view' && selectedTour ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedTour.destination}, {selectedTour.country}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedTour.description}</p>
                </div>
                <Link
                  to={`/tours/${getTourSlug(selectedTour)}`}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Open Public Tour Page
                </Link>
              </div>

              <div className="w-full h-52 rounded-lg overflow-hidden border border-gray-100">
                <img
                  src={selectedTour.img}
                  alt={selectedTour.destination}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedTour.category}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedTour.duration} days</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">Planned Activities</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedTour.plan.length}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-500">Budget Per Traveler</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatInr(getTourPricePerTraveler(selectedTour))}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Itinerary Plan</h3>
                <div className="space-y-2">
                  {selectedTour.plan.map((dayPlan, index) => (
                    <div
                      key={`${selectedTour.id}-${index + 1}`}
                      className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    >
                      {dayPlan}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {(editorMode === 'edit' || editorMode === 'create') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-800">
                  {editorMode === 'create' ? 'Add New Trip' : 'Edit Trip'}
                </h2>
                <button
                  type="button"
                  onClick={cancelEditor}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Destination</span>
                  <input
                    type="text"
                    value={tourForm.destination}
                    onChange={(event) => setFormField('destination', event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Country</span>
                  <input
                    type="text"
                    value={tourForm.country}
                    onChange={(event) => setFormField('country', event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Category</span>
                  <select
                    value={tourForm.category}
                    onChange={(event) => setFormField('category', event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Duration (days)</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tourForm.duration}
                    onChange={(event) => setFormField('duration', event.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-600">Budget Per Traveler (INR)</span>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    value={tourForm.pricePerTraveler}
                    onChange={(event) => setFormField('pricePerTraveler', event.target.value)}
                    placeholder="Leave blank for auto"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-600">Image URL</span>
                <input
                  type="text"
                  value={tourForm.img}
                  onChange={(event) => setFormField('img', event.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-600">Description</span>
                <textarea
                  rows={3}
                  value={tourForm.description}
                  onChange={(event) => setFormField('description', event.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-gray-600">
                  Itinerary Plan (one day per line)
                </span>
                <textarea
                  rows={8}
                  value={tourForm.planText}
                  onChange={(event) => setFormField('planText', event.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-green-700">{saveMessage}</p>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  {editorMode === 'create' ? 'Create Trip' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {!selectedTour && editorMode === 'view' ? (
            <p className="text-sm text-gray-500">Select a tour to view details.</p>
          ) : null}

          {saveMessage && editorMode === 'view' ? (
            <p className="text-xs text-green-700 mt-4">{saveMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default AdminTripsItinerariesPanel;
