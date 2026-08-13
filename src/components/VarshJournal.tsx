import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import './VarshJournal.css';

interface JournalPost {
  id: number;
  image: string;
  title: string;
  category: string;
  sizeClass: string;
  link: string;
}

const VarshJournal = () => {
  const posts: JournalPost[] = [
    { 
      id: 1, 
      image: '/house_of_varsh-2026-08-12/711588411_18074607044422704_4472902898677723867_n.jpg', 
      title: 'Atelier Vol. IV', 
      category: 'Couture Showcase', 
      sizeClass: 'journal-large',
      link: 'https://instagram.com/house_of_varsh'
    },
    { 
      id: 2, 
      image: '/house_of_varsh-2026-08-12/711618745_18074607056422704_7491652275031072647_n.jpg', 
      title: 'Behind the Seams', 
      category: 'Artisanal Drape', 
      sizeClass: 'journal-tall',
      link: 'https://instagram.com/house_of_varsh'
    },
    { 
      id: 3, 
      image: '/house_of_varsh-2026-08-12/711546631_18074607068422704_6536488054165914755_n.jpg', 
      title: 'Gilded Weave', 
      category: 'Metallic Silk', 
      sizeClass: 'journal-wide',
      link: 'https://instagram.com/house_of_varsh'
    },
    { 
      id: 4, 
      image: '/house_of_varsh-2026-08-12/710700887_18074607080422704_8214498459316945007_n.jpg', 
      title: 'The Royal Crest', 
      category: 'Heritage Zardozi', 
      sizeClass: 'journal-standard',
      link: 'https://instagram.com/house_of_varsh'
    },
    { 
      id: 5, 
      image: '/house_of_varsh-2026-08-12/711695758_18074607089422704_5967906297063597220_n.jpg', 
      title: 'Velvet Whispers', 
      category: 'Sartorial Masterpiece', 
      sizeClass: 'journal-standard',
      link: 'https://instagram.com/house_of_varsh'
    },
    { 
      id: 6, 
      image: '/house_of_varsh-2026-08-12/711514084_18074607200422704_7278914208181436219_n.jpg', 
      title: 'Crimson Splendor', 
      category: 'Royal Silhouettes', 
      sizeClass: 'journal-wide',
      link: 'https://instagram.com/house_of_varsh'
    }
  ];

  return (
    <section className="section varsh-journal" id="journal">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Follow Our Journey</span>
          <h2 className="section-title">The Maison Journal</h2>
        </div>

        <div className="journal-grid">
          {posts.map((post, index) => (
            <motion.a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              key={post.id}
              className={`journal-item ${post.sizeClass}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, delay: index * 0.1, ease: [0.25, 1, 0.5, 1] }}
            >
              <div className="journal-frame-inner">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="journal-img" 
                  loading="lazy" 
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg';
                  }}
                />
                <div className="journal-overlay">
                  <div className="journal-metadata">
                    <span className="journal-item-category">{post.category}</span>
                    <h3 className="journal-item-title">{post.title}</h3>
                  </div>
                  <div className="instagram-icon-wrap">
                    <Instagram size={20} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VarshJournal;
