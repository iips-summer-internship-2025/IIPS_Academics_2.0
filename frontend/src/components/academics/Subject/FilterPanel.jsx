import { SearchIcon, XIcon } from "../../../Icons";

function FilterPanel({
  searchFilter,
  setSearchFilter,
  semesterFilter,
  setSemesterFilter,
  departmentFilter,
  setDepartmentFilter,
  departments,
  semesters,
  clearFilters,
}) {
  const hasActiveFilters = searchFilter || semesterFilter || departmentFilter;

  return (
    <div className="py-6"> {}
      <div className="flex items-center justify-between mb-6">
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm cursor-pointer"
            title="Clear all filters"
          >
            <XIcon size={16} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Subject
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search subjects or instructors..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C79745] focus:border-[#C79745] transition-all duration-200 sm:text-sm"
            />
          </div>
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semester
          </label>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C79745] focus:border-[#C79745] transition-all duration-200 sm:text-sm bg-white cursor-pointer"
          >
            <option value="">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programs
          </label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C79745] focus:border-[#C79745] transition-all duration-200 sm:text-sm bg-white cursor-pointer"
          >
            <option value="">All Courses</option>
            {}
            {(departments || []).map((course) => (
              <option key={course.id} value={course.id}> {}
                {course.name} {}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Search: "{searchFilter}"
                </span>
              )}
              {semesterFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Semester {semesterFilter}
                </span>
              )}
              {departmentFilter && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  { (departments.find(dept => dept.id === departmentFilter))?.name || departmentFilter }
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
