/**
 * Ultra-Performant GSAP Draggable System
 * Enhanced version with better error handling and debugging
 */

export const GSAPDraggableManager = {
    instances: new Map(),
    
    // Initialize high-performance dragging for a panel
    initializeDraggable(panelElement, options = {}) {
        if (!panelElement) {
            console.warn('⚠️ No panel element provided for draggable initialization');
            return null;
        }
        
        // Check if element is already draggable
        const panelId = panelElement.id || `draggable-${Date.now()}`;
        if (this.instances.has(panelId)) {
            console.log(`🔄 Cleaning up existing draggable: ${panelId}`);
            this.destroyDraggable(panelId);
        }
        
        // Add ID if not present
        if (!panelElement.id) {
            panelElement.id = panelId;
        }
        
        // Check GSAP availability
        if (typeof window !== 'undefined' && window.gsap && window.Draggable) {
            console.log(`⚡ Initializing GSAP draggable: ${panelId}`);
            return this.initializeGSAPDraggable(panelElement, options);
        } else {
            console.warn('⚠️ GSAP or Draggable not available - using fallback dragging');
            return this.initializeFallbackDraggable(panelElement, options);
        }
    },
    
    // GSAP-powered dragging
    initializeGSAPDraggable(panelElement, options = {}) {
        const panelId = panelElement.id;
        
        try {
            // Register GSAP plugin
            gsap.registerPlugin(Draggable);
            
            // Find drag handle - look for .panel-header or use whole element
            const dragHandle = panelElement.querySelector('.panel-header') || panelElement;
            
            // Set up hardware acceleration immediately
            gsap.set(panelElement, {
                willChange: 'transform',
                force3D: true,
                cursor: 'grab'
            });
            
            // Create ultra-simple draggable instance
            const draggableInstance = Draggable.create(panelElement, {
                type: 'x,y',
                trigger: dragHandle,
                bounds: {
                    minX: -window.innerWidth,  // Allow dragging completely off-screen to the left
                    minY: -100,                // Allow dragging slightly above viewport
                    maxX: window.innerWidth,   // Allow dragging completely off-screen to the right
                    maxY: window.innerHeight   // Allow dragging to bottom of viewport
                },
                
                // Performance settings
                force3D: true,
                allowEventDefault: false,
                inertia: false, // Disable inertia for more control
                
                // Visual feedback handlers
                onPress: function() {
                    console.log('🎯 Drag started on:', panelId);
                    gsap.set(panelElement, { cursor: 'grabbing' });
                },
                
                onDragStart: function() {
                    console.log('🚀 Dragging:', panelId);
                    gsap.set(panelElement, { 
                        zIndex: 9999,
                        scale: 1.02,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    });
                },
                
                onDrag: function() {
                    // Update bounds dynamically in case window is resized
                    this.applyBounds({
                        minX: -window.innerWidth,  // Allow dragging completely off-screen to the left
                        minY: -100,                // Allow dragging slightly above viewport
                        maxX: window.innerWidth,   // Allow dragging completely off-screen to the right
                        maxY: window.innerHeight   // Allow dragging to bottom of viewport
                    });
                },
                
                onDragEnd: function() {
                    console.log('✅ Drag ended:', panelId);
                    gsap.to(panelElement, {
                        duration: 0.3,
                        ease: 'power2.out',
                        cursor: 'grab',
                        zIndex: 9999,
                        scale: 1,
                        boxShadow: '0 12px 24px rgba(0,0,0,0.3)'
                    });
                }
            })[0];
            
            // Store instance data
            const instance = {
                element: panelElement,
                gsapInstance: draggableInstance,
                type: 'gsap',
                cleanup: () => {
                    console.log(`🧹 Cleaning up GSAP draggable: ${panelId}`);
                    if (draggableInstance) {
                        draggableInstance.kill();
                    }
                    gsap.set(panelElement, { clearProps: 'all' });
                }
            };
            
            this.instances.set(panelId, instance);
            console.log(`✅ GSAP draggable ready: ${panelId}`);
            
            return instance;
            
        } catch (error) {
            console.error('❌ GSAP draggable failed, using fallback:', error);
            return this.initializeFallbackDraggable(panelElement, options);
        }
    },
    
    // Fallback draggable system (vanilla JS) - extremely lightweight
    initializeFallbackDraggable(panelElement, options = {}) {
        const panelId = panelElement.id;
        
        console.log(`🔄 Initializing fallback draggable: ${panelId}`);
        
        // Find drag handle
        const dragHandle = panelElement.querySelector('.panel-header') || panelElement;
        
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;
        
        // Mouse/touch event handlers
        const handleStart = (e) => {
            // Prevent dragging on interactive elements
            if (e.target.closest('button, input, select, textarea, .expand-btn')) {
                return;
            }
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (!clientX || !clientY) return;
            
            isDragging = true;
            startX = clientX;
            startY = clientY;
            
            // Get current transform
            const style = window.getComputedStyle(panelElement);
            const transform = style.transform;
            
            if (transform && transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                initialX = matrix.m41;
                initialY = matrix.m42;
            } else {
                initialX = 0;
                initialY = 0;
            }
            
            // Visual feedback
            panelElement.style.cursor = 'grabbing';
            panelElement.style.zIndex = '9999';
            panelElement.style.transform = `translate3d(${initialX}px, ${initialY}px, 0) scale(1.02)`;
            panelElement.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
            
            // Add event listeners
            document.addEventListener('mousemove', handleMove, { passive: false });
            document.addEventListener('mouseup', handleEnd, { passive: true });
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd, { passive: true });
            
            // Prevent default to avoid scrolling on touch devices
            e.preventDefault();
            
            console.log('🎯 Fallback drag started on:', panelId);
        };
        
        // Mouse/touch move handler - ultra-performant
        const handleMove = (e) => {
            if (!isDragging) return;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (!clientX || !clientY) return;
            
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            
            // Use transform for hardware acceleration
            panelElement.style.transform = `translate3d(${initialX + deltaX}px, ${initialY + deltaY}px, 0) scale(1.02)`;
            
            // Prevent default to avoid scrolling
            e.preventDefault();
        };
        
        // Mouse/touch end handler
        const handleEnd = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            
            // Remove scale and restore normal state
            const style = window.getComputedStyle(panelElement);
            const transform = style.transform;
            
            if (transform && transform !== 'none') {
                const matrix = new DOMMatrix(transform);
                panelElement.style.transform = `translate3d(${matrix.m41}px, ${matrix.m42}px, 0)`;
            }
            
            panelElement.style.cursor = 'grab';
            panelElement.style.zIndex = '1000';
            panelElement.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
            
            // Remove event listeners
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
            
            console.log('✅ Fallback drag ended:', panelId);
        };
        
        // Set up draggable styles
        panelElement.style.cursor = 'grab';
        panelElement.style.willChange = 'transform';
        panelElement.style.userSelect = 'none';
        
        // Add event listeners to drag handle
        dragHandle.addEventListener('mousedown', handleStart, { passive: false });
        dragHandle.addEventListener('touchstart', handleStart, { passive: false });
        
        // Store instance
        const instance = {
            element: panelElement,
            type: 'fallback',
            cleanup: () => {
                console.log(`🧹 Cleaning up fallback draggable: ${panelId}`);
                dragHandle.removeEventListener('mousedown', handleStart);
                dragHandle.removeEventListener('touchstart', handleStart);
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleEnd);
                document.removeEventListener('touchmove', handleMove);
                document.removeEventListener('touchend', handleEnd);
                
                // Reset styles
                panelElement.style.cursor = '';
                panelElement.style.willChange = '';
                panelElement.style.userSelect = '';
                panelElement.style.transform = '';
                panelElement.style.zIndex = '';
                panelElement.style.boxShadow = '';
            }
        };
        
        this.instances.set(panelId, instance);
        console.log(`✅ Fallback draggable ready: ${panelId}`);
        
        return instance;
    },
    
    // Clean up draggable instance
    destroyDraggable(panelId) {
        if (this.instances.has(panelId)) {
            const instance = this.instances.get(panelId);
            if (instance && instance.cleanup) {
                instance.cleanup();
            }
            this.instances.delete(panelId);
            console.log(`🗑️ Cleaned up draggable: ${panelId}`);
        }
    },
    
    // Cleanup all instances
    destroyAll() {
        console.log('🧹 Cleaning up all draggable instances...');
        this.instances.forEach((instance, panelId) => {
            this.destroyDraggable(panelId);
        });
        console.log('✅ All draggable instances cleaned up');
    },
    
    // Get status of all draggable instances
    getStatus() {
        const status = {};
        this.instances.forEach((instance, panelId) => {
            status[panelId] = {
                active: !!instance,
                type: instance.type || 'unknown',
                element: instance.element || null,
                hasGsap: instance.gsapInstance ? true : false
            };
        });
        return status;
    },
    
    // Debug function to log all instances
    debugInstances() {
        console.log('🔍 Debug: Active draggable instances:');
        console.table(this.getStatus());
    }
};

// Simple initialization function for Vue components
export function initializeEnhancedDraggable(panelRef) {
    if (!panelRef) {
        console.warn('⚠️ Panel ref not available for draggable initialization');
        return null;
    }
    
    // Add unique ID if not present
    if (!panelRef.id) {
        panelRef.id = `enhanced-panel-${Date.now()}`;
    }
    
    console.log('🎯 Initializing enhanced draggable for:', panelRef.id);
    return GSAPDraggableManager.initializeDraggable(panelRef);
}

// Cleanup function
export function cleanupAllDraggables() {
    GSAPDraggableManager.destroyAll();
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.GSAPDraggableManager = GSAPDraggableManager;
}

// Export default for easier importing
export default GSAPDraggableManager; 