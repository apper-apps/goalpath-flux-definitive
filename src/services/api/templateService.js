import templatesData from '@/services/mockData/templates.json';

let templates = [...templatesData];

class TemplateService {
  async getAll() {
    await this.delay();
    return [...templates];
  }

  async getByCategory(category) {
    await this.delay();
    return templates.filter(template => template.category === category);
  }

  async getById(id) {
    await this.delay();
    const template = templates.find(t => t.Id === parseInt(id));
    if (!template) {
      throw new Error(`Template with ID ${id} not found`);
    }
    return { ...template };
  }

  async getCategories() {
    await this.delay();
    const categories = [...new Set(templates.map(t => t.category))];
    return categories.map(category => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      count: templates.filter(t => t.category === category).length,
      icon: this.getCategoryIcon(category)
    }));
  }

  getCategoryIcon(category) {
    const icons = {
      fitness: 'Dumbbell',
      career: 'Briefcase', 
      learning: 'BookOpen',
      finance: 'DollarSign'
    };
    return icons[category] || 'Target';
  }

  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const templateService = new TemplateService();