class BatchProcessor {
    constructor(maxConcurrent = 2) {
        this.maxConcurrent = maxConcurrent;
        this.isProcessing = false;
        this.currentBatch = [];
        this.onProgress = null;
        this.onStateChange = null;
        this.completedCount = 0;
        this.totalCount = 0;
        this.errors = [];
    }

    async processBatch(urls, scraper) {
        if (this.isProcessing) {
            throw new Error('Batch processing already in progress');
        }

        this.isProcessing = true;
        this.currentBatch = urls.map(url => ({
            url: typeof url === 'string' ? url : url.url,
            id: typeof url === 'string' ? url : url.id,
            status: 'pending',
            result: null,
            error: null
        }));
        
        this.completedCount = 0;
        this.totalCount = this.currentBatch.length;
        this.errors = [];

        console.log(`🚀 Starting batch processing of ${this.totalCount} URLs with concurrency: ${this.maxConcurrent}`);

        try {
            // Process URLs in batches with controlled concurrency
            const results = await this.processWithConcurrency(this.currentBatch, scraper);
            
            console.log(`✅ Batch processing completed. Processed: ${this.completedCount}, Errors: ${this.errors.length}`);
            
            return {
                success: true,
                total: this.totalCount,
                completed: this.completedCount,
                errors: this.errors.length,
                results: results
            };
            
        } catch (error) {
            console.error('❌ Batch processing failed:', error);
            throw error;
        } finally {
            this.isProcessing = false;
            this.emitStateChange('completed');
        }
    }

    async processWithConcurrency(batch, scraper) {
        const results = [];
        const executing = [];

        for (const item of batch) {
            if (!this.isProcessing) {
                break; // Stop if processing was cancelled
            }

            const promise = this.processItem(item, scraper).then(result => {
                executing.splice(executing.indexOf(promise), 1);
                return result;
            });

            results.push(promise);
            executing.push(promise);

            if (executing.length >= this.maxConcurrent) {
                await Promise.race(executing);
            }
        }

        return Promise.allSettled(results);
    }

    async processItem(item, scraper) {
        try {
            console.log(`📊 Processing: ${item.url}`);
            
            item.status = 'processing';
            this.emitProgress();
            
            const result = await scraper.processURL(item.url);
            
            item.status = 'completed';
            item.result = result;
            this.completedCount++;
            
            console.log(`✅ Completed: ${item.url}`);
            
            this.emitProgress();
            
            return {
                id: item.id,
                url: item.url,
                success: true,
                result: result
            };
            
        } catch (error) {
            console.error(`❌ Error processing ${item.url}:`, error);
            
            item.status = 'error';
            item.error = error.message;
            this.errors.push({
                id: item.id,
                url: item.url,
                error: error.message
            });
            
            this.emitProgress();
            
            return {
                id: item.id,
                url: item.url,
                success: false,
                error: error.message
            };
        }
    }

    emitProgress() {
        if (this.onProgress) {
            const progress = {
                total: this.totalCount,
                completed: this.completedCount,
                errors: this.errors.length,
                percentage: this.totalCount > 0 ? Math.round((this.completedCount / this.totalCount) * 100) : 0,
                currentBatch: this.currentBatch.map(item => ({
                    id: item.id,
                    url: item.url,
                    status: item.status
                }))
            };
            
            this.onProgress(progress);
        }
    }

    emitStateChange(state) {
        if (this.onStateChange) {
            this.onStateChange({
                isProcessing: this.isProcessing,
                state: state,
                timestamp: new Date().toISOString()
            });
        }
    }

    async stop() {
        console.log('🛑 Stopping batch processing...');
        this.isProcessing = false;
        this.emitStateChange('stopped');
        
        return {
            success: true,
            message: 'Batch processing stopped',
            completed: this.completedCount,
            total: this.totalCount
        };
    }

    getStatus() {
        return {
            isProcessing: this.isProcessing,
            total: this.totalCount,
            completed: this.completedCount,
            errors: this.errors.length,
            percentage: this.totalCount > 0 ? Math.round((this.completedCount / this.totalCount) * 100) : 0
        };
    }
}

module.exports = BatchProcessor; 