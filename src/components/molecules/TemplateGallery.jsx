import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { scroll, scroller } from "react-scroll";
import { toast } from "react-toastify";
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
  const contentRef = useRef(null);
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

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch = !searchQuery || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
    toast.success(`Template "${template.title}" selected! 🎯`);
  };

  if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-surface rounded-2xl border border-slate-600/50 w-full max-w-6xl min-h-[80vh] max-h-[95vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-600/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold gradient-text mb-2">
                Goal Template Gallery
              </h2>
              <p className="text-slate-400">
                Choose from pre-designed templates to jumpstart your goal tracking
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="p-2"
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
              icon="Search"
            />
          </div>
        </div>
{/* Category Tabs */}
        <div className="px-6 py-4 border-b border-slate-600/50 overflow-x-auto flex-shrink-0">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              // Calculate dynamic count for each category
              const categoryCount = category.value === 'all' 
                ? templates.length 
                : templates.filter(template => template.category === category.value).length;
              
              return (
<Button
                  key={category.value}
                  variant={activeCategory === category.value ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveCategory(category.value);
                    // Scroll to top of content when category changes
                    if (contentRef.current) {
                      contentRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    activeCategory === category.value ? 'text-white' : ''
                  }`}
>
                  <ApperIcon name={category.icon} size={16} />
                  {category.label}
                  <Badge 
                    variant={activeCategory === category.value ? "primary" : "secondary"} 
                    className="ml-1"
                  >
                    {categoryCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
{/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 scroll-smooth relative min-h-[400px]"
          onScroll={(e) => {
            const scrollTop = e.target.scrollTop;
            setShowScrollTop(scrollTop > 200);
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading type="templates" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <Error message={error} onRetry={loadData} />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <ApperIcon name="Search" size={48} className="mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
              <p className="text-slate-400">
                {searchQuery 
                  ? "Try adjusting your search terms or category filter"
                  : `No templates available in the ${activeCategory} category`
                }
              </p>
</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-surface/50 rounded-xl border border-slate-600/50 p-6 hover:border-primary/50 transition-all group cursor-pointer"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <ApperIcon 
                            name={template.icon} 
                            size={20} 
                            className="text-primary"
                          />
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        {template.suggestedDuration} days
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                      {template.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ApperIcon name="Target" size={12} />
                        {template.milestoneTemplates.length} milestones
                      </div>
                      
                      <Button
                        variant="accent"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Use Template
                      </Button>
                    </div>
                  </motion.div>
                ))}
</AnimatePresence>
            </div>
          )}
          
          {/* Scroll to Top Button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  if (contentRef.current) {
                    contentRef.current.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="fixed bottom-6 right-6 bg-primary hover:bg-primary/80 text-white p-3 rounded-full shadow-lg transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ApperIcon name="ChevronUp" size={20} />
              </motion.button>
            )}
          </AnimatePresence>
</div>
        {/* Footer */}
        <div className="p-6 border-t border-slate-600/50 bg-surface/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </p>
            <Button variant="secondary" onClick={onClose}>
              Close Gallery
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateGallery;