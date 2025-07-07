// Enhanced GSAP Draggable System for Consistent Performance
export const GSAPDraggableManager = {
    instances: new Map(),
    
    // Initialize GSAP dragging for a panel
    initializeDraggable(panelElement, options = {}) {
        const panelId = panelElement.id || 'enhanced-panel-' + Date.now();
        
        // Clean up existing instance
        this.destroyDraggable(panelId);
        
        console.log(`🎯 Initializing GSAP draggable for: ${panelId}`);
        
        try {
            // Check if GSAP and Draggable are available globally
            if (typeof gsap === 'undefined' || typeof Draggable === 'undefined') {
                throw new Error('GSAP or Draggable plugin not available globally');
            }
            
            // Register GSAP plugins
            gsap.registerPlugin(Draggable);
            
            // Enhanced trigger selection with fallback hierarchy
            let dragHandle = panelElement.querySelector('.panel-header, .enhanced-action-panel > div:first-child, .drag-handle');
            
            // If no specific handle found, use the panel itself but avoid interactive elements
            if (!dragHandle) {
                dragHandle = panelElement;
                console.log('⚠️ Using entire panel as drag handle - this might cause interaction issues');
            }
            
            console.log('🎯 Using drag handle:', dragHandle?.className || 'entire panel');
            
            // Create ultra-smooth GSAP draggable instance with enhanced configuration
            const draggableInstance = Draggable.create(panelElement, {
                type: "x,y",
                trigger: dragHandle,
                
                // Momentum and physics
                inertia: true,
                edgeResistance: 0.65,
                dragResistance: 0,
                
                // Advanced performance settings
                force3D: true,
                allowEventDefault: false,
                allowContextMenu: true,
                autoScroll: false,
                
                // Interaction filtering to avoid conflicts with buttons/inputs
                clickableTest: (element) => {
                    // Prevent dragging when clicking on interactive elements
                    return !element.closest('.control-btn, .progress-slider, .expand-btn, button, input, select, textarea, [data-no-drag]');
                },
                
                onPress: () => {
                    console.log('🎯 GSAP drag press detected');
                    // Immediate visual feedback on press
                    gsap.set(panelElement, { 
                        cursor: 'grabbing',
                        userSelect: 'none',
                        scale: 1.02,
                        zIndex: 9999
                    });
                },
                
                onDragStart: () => {
                    console.log('🎯 GSAP drag started');
                    // Enhanced visual feedback during drag
                    gsap.set(panelElement, { 
                        boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(217, 119, 6, 0.3)",
                        filter: "brightness(1.15) drop-shadow(0 0 10px rgba(217, 119, 6, 0.4))",
                        scale: 1.05
                    });
                },
                
                onDrag: () => {
                    // Minimal drag processing for maximum performance
                    // Just maintain the enhanced visual state
                },
                
                onDragEnd: () => {
                    console.log('📍 GSAP drag completed');
                    // Smooth transition back to normal state
                    gsap.to(panelElement, {
                        duration: 0.3,
                        ease: "power2.out",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(217, 119, 6, 0.1)",
                        filter: "brightness(1)",
                        scale: 1,
                        cursor: 'grab',
                        userSelect: '',
                        zIndex: 1000
                    });
                },
                
                onRelease: () => {
                    console.log('📍 GSAP drag released');
                    // Ensure cursor returns to normal even on release without drag
                    gsap.set(panelElement, { 
                        cursor: 'grab',
                        userSelect: ''
                    });
                }
            })[0]; // Get first (and only) instance
            
            // Validate draggable instance creation
            if (!draggableInstance) {
                throw new Error('Failed to create GSAP Draggable instance');
            }
            
            // Set initial optimizations and accessibility
            gsap.set(panelElement, {
                cursor: 'grab',
                userSelect: 'none',
                willChange: 'transform',
                force3D: true, // Hardware acceleration
                transformOrigin: 'center center'
            });
            
            // Add data attributes for better interaction filtering
            panelElement.setAttribute('data-draggable', 'true');
            
            // Mark interactive elements to prevent drag conflicts
            const interactiveElements = panelElement.querySelectorAll('.control-btn, .progress-slider, .expand-btn, button, input, select, textarea');
            interactiveElements.forEach(el => el.setAttribute('data-no-drag', 'true'));
            
            // Store instance for cleanup
            const instance = {
                element: panelElement,
                gsapInstance: draggableInstance,
                cleanup: () => {
                    if (draggableInstance) {
                        draggableInstance.kill();
                    }
                    // Reset styles
                    gsap.set(panelElement, {
                        cursor: '',
                        userSelect: '',
                        willChange: '',
                        transform: '',
                        zIndex: '',
                        clearProps: 'all'
                    });
                }
            };
            
            this.instances.set(panelId, instance);
            console.log(`⚡ GSAP draggable initialized successfully for: ${panelId}`);
            
            return instance;
            
        } catch (error) {
            console.error('❌ Error initializing GSAP draggable:', error);
            return null;
        }
    },
    
    // Clean up draggable instance
    destroyDraggable(panelId) {
        if (this.instances.has(panelId)) {
            const instance = this.instances.get(panelId);
            if (instance && instance.cleanup) {
                instance.cleanup();
            }
            this.instances.delete(panelId);
            console.log(`🗑️ Cleaned up GSAP draggable: ${panelId}`);
        }
    },
    
    // Cleanup all instances
    destroyAll() {
        this.instances.forEach((instance, panelId) => {
            this.destroyDraggable(panelId);
        });
        console.log('🧹 All GSAP draggable instances cleaned up');
    },
    
    // Get status of all instances
    getStatus() {
        const status = {};
        this.instances.forEach((instance, panelId) => {
            status[panelId] = {
                active: !!instance,
                element: instance ? instance.element : null,
                gsapInstance: instance ? instance.gsapInstance : null
            };
        });
        return status;
    }
};

// Enhanced GSAP Draggable Initialization Function for Vue Components
export function initializeEnhancedDraggable(panelRef) {
    if (!panelRef) {
        console.warn('Panel ref not available for GSAP draggable initialization');
        return null;
    }
    
    // Add unique ID if not present
    if (!panelRef.id) {
        panelRef.id = 'enhanced-panel-' + Math.random().toString(36).substr(2, 9);
    }
    
    const instance = GSAPDraggableManager.initializeDraggable(panelRef);
    
    if (instance) {
        console.log('⚡ Enhanced GSAP draggable initialized successfully');
    } else {
        console.error('❌ Failed to initialize GSAP draggable');
    }
    
    return instance;
}

// Global cleanup function
export function cleanupAllDraggables() {
    GSAPDraggableManager.destroyAll();
}

// Make available globally for compatibility
if (typeof window !== 'undefined') {
    window.GSAPDraggableManager = GSAPDraggableManager;
    window.initializeEnhancedDraggable = initializeEnhancedDraggable;
    window.cleanupAllDraggables = cleanupAllDraggables;
} 