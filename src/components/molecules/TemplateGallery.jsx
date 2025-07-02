import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { scroll, scroller } from "react-scroll";
import { toast } from "react-toastify";
import { useInView } from "react-intersection-observer";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import { templateService } from "@/services/api/templateService";
const TemplateGallery = ({ isOpen, onClose, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const contentRef = useRef(null);
  const searchInputRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [templatesData, categoriesData] = await Promise.all([
        templateService.getAll(),
        templateService.getCategories()
      ]);
      
setTemplates(templatesData);
      setCategories([
        { value: 'all', label: 'All Templates', icon: 'Grid3X3' },
        ...categoriesData
      ]);
    } catch (err) {
      setError('Failed to load templates');
      toast.error('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };
// Debounced search for performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
      const matchesSearch = !debouncedSearchQuery || 
        template.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [templates, activeCategory, debouncedSearchQuery]);

  if (!isOpen) return null;

const handleSelectTemplate = useCallback((template) => {
    setSelectedTemplateId(template.Id);
    setTimeout(() => {
      onSelectTemplate(template);
      onClose();
      toast.success(`Template "${template.title}" selected! 🎯`);
    }, 150); // Brief delay for visual feedback
  }, [onSelectTemplate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '/' && e.metaKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);
return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="glass rounded-3xl border border-slate-500/30 w-full max-w-7xl min-h-[85vh] max-h-[95vh] flex flex-col overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.90) 100%)'
        }}
      >
{/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-500/30 flex-shrink-0 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                  <ApperIcon name="Layout" size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold gradient-text">
                  Template Gallery
                </h2>
              </div>
              <p className="text-slate-400 text-sm sm:text-base">
                Choose from {templates.length} professionally designed templates to accelerate your goal achievement
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-3 hover:bg-slate-700/50 rounded-xl transition-all self-end sm:self-auto"
              aria-label="Close gallery"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          {/* Enhanced Search */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                ref={searchInputRef}
                placeholder="Search templates... (⌘/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border-slate-600/50 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                icon="Search"
                aria-label="Search templates"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <ApperIcon name="X" size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
{/* Enhanced Category Pills */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-500/30 overflow-x-auto flex-shrink-0 bg-slate-800/20">
          <div className="flex gap-3 min-w-max">
            {categories.map((category) => {
              const categoryCount = category.value === 'all' 
                ? templates.length 
                : templates.filter(template => template.category === category.value).length;
              
              const isActive = activeCategory === category.value;
              
              return (
                <motion.button
                  key={category.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveCategory(category.value);
                    if (contentRef.current) {
                      contentRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                    }
                  `}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${category.label}`}
                >
                  <ApperIcon name={category.icon} size={16} />
                  <span>{category.label}</span>
                  <Badge 
                    variant={isActive ? "primary" : "secondary"} 
                    className={`ml-1 text-xs ${isActive ? 'bg-white/20' : ''}`}
                  >
                    {categoryCount}
                  </Badge>
                </motion.button>
              );
            })}
          </div>
        </div>
{/* Enhanced Content Area */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth relative min-h-[400px] custom-scrollbar"
          onScroll={(e) => {
            const scrollTop = e.target.scrollTop;
            setShowScrollTop(scrollTop > 300);
          }}
        >
          {loading ? (
            <div className="space-y-6">
              {/* Enhanced Loading State */}
              <div className="text-center py-8">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Loading Templates</h3>
                  <p className="text-slate-400">Discovering amazing goal templates for you...</p>
                </div>
              </div>
              
              {/* Skeleton Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-xl p-6 space-y-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
                      <div className="w-16 h-5 bg-slate-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-3/4 h-5 bg-slate-700 rounded"></div>
                      <div className="w-full h-4 bg-slate-700 rounded"></div>
                      <div className="w-2/3 h-4 bg-slate-700 rounded"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-20 h-4 bg-slate-700 rounded"></div>
                      <div className="w-24 h-8 bg-slate-700 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-6 bg-error/20 rounded-2xl flex items-center justify-center">
                  <ApperIcon name="AlertCircle" size={32} className="text-error" />
                </div>
                <Error message={error} onRetry={loadData} />
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/50 rounded-2xl flex items-center justify-center">
                <ApperIcon name={searchQuery ? "Search" : "Package"} size={40} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {searchQuery ? "No matching templates" : `No ${activeCategory} templates`}
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? "Try adjusting your search terms or browse different categories to find the perfect template."
                  : `We're working on adding more templates to the ${activeCategory} category. Check back soon!`
                }
              </p>
              {searchQuery && (
                <Button
                  variant="secondary"
                  onClick={() => setSearchQuery('')}
                  className="mx-auto"
                >
                  <ApperIcon name="X" size={16} className="mr-2" />
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template, index) => {
                  const isSelected = selectedTemplateId === template.Id;
                  
                  return (
                    <motion.div
                      key={template.Id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: isSelected ? 0.95 : 1,
                        rotateY: isSelected ? 5 : 0
                      }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ 
                        delay: Math.min(index * 0.03, 0.5),
                        type: "spring",
                        duration: 0.6
                      }}
                      whileHover={{ 
                        y: -4, 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-sm 
                        rounded-2xl border border-slate-600/30 p-5 sm:p-6 
                        hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10
                        transition-all duration-300 group cursor-pointer overflow-hidden
                        ${isSelected ? 'ring-2 ring-primary/50 bg-primary/5' : ''}
                      `}
                      onClick={() => handleSelectTemplate(template)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${template.title} template`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectTemplate(template);
                        }
                      }}
                    >
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      
                      {/* Header */}
                      <div className="relative flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="p-2.5 bg-gradient-to-br from-primary/20 to-accent/15 rounded-xl group-hover:scale-110 transition-transform duration-200"
                            whileHover={{ rotate: 5 }}
                          >
                            <ApperIcon 
                              name={template.icon} 
                              size={20} 
                              className="text-primary group-hover:text-accent transition-colors duration-200"
                            />
                          </motion.div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            variant="secondary" 
                            className="capitalize text-xs bg-slate-700/50 border-slate-600/50"
                          >
                            {template.category}
                          </Badge>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <ApperIcon name="Calendar" size={12} />
                            {template.suggestedDuration}d
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative">
                        <h3 className="font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-1">
                          {template.title}
                        </h3>
                        
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {template.description}
                        </p>

                        {/* Stats & Action */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Target" size={12} />
                              <span>{template.milestoneTemplates.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Users" size={12} />
                              <span>{template.usageCount || 0}</span>
                            </div>
                          </div>
                          
                          <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0 
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <Button
                              variant="accent"
                              size="sm"
                              className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent border-0 shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectTemplate(template);
                              }}
                            >
                              <ApperIcon name="Plus" size={14} className="mr-1" />
                              Use
                            </Button>
                          </motion.div>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                          >
                            <ApperIcon name="Check" size={14} className="text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
})}
              </AnimatePresence>
            </div>
          )}
        </div>
{/* Enhanced Scroll to Top Button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                onClick={() => {
                  if (contentRef.current) {
                    contentRef.current.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white p-4 rounded-2xl shadow-xl shadow-primary/25 transition-all duration-200 z-10 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Scroll to top"
              >
                <ApperIcon name="ArrowUp" size={20} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-500/30 bg-gradient-to-r from-slate-800/30 to-slate-700/20 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <ApperIcon name="Sparkles" size={16} className="text-primary" />
                <span>
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} 
                  {activeCategory !== 'all' && ` in ${activeCategory}`}
                </span>
              </div>
              {searchQuery && (
                <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-700/50 px-3 py-1 rounded-full">
                  <ApperIcon name="Search" size={12} />
                  <span>"{searchQuery}"</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-slate-400 hover:text-white"
              >
                <ApperIcon name="RotateCcw" size={16} className="mr-2" />
                Reset Filters
              </Button>
              <Button 
                variant="secondary" 
                onClick={onClose}
                className="bg-slate-700/50 hover:bg-slate-600/50 border-slate-600/50"
              >
                <ApperIcon name="X" size={16} className="mr-2" />
                Close Gallery
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateGallery;