import pptxgen from 'pptxgenjs';

export interface SlideData {
  title: string;
  content: string;
  bgColor: string;
  textColor: string;
}

export class PowerPointService {
  /**
   * Generate a PowerPoint file from slide data
   */
  static async generatePowerPoint(
    slides: SlideData[],
    presentationTitle: string = 'Professional Training'
  ): Promise<Blob> {
    const pptx = new pptxgen();

    // Presentation configuration
    pptx.author = 'AI Training Platform';
    pptx.company = 'Training Platform';
    pptx.subject = presentationTitle;
    pptx.title = presentationTitle;

    // Generate each slide
    slides.forEach((slideData, index) => {
      const slide = pptx.addSlide();

      // Background with gradient
      slide.background = { color: slideData.bgColor };

      // Decorative circles
      slide.addShape(pptx.ShapeType.ellipse, {
        x: 0.5,
        y: 0.5,
        w: 1.2,
        h: 1.2,
        fill: { color: slideData.textColor, transparency: 90 }
      });

      slide.addShape(pptx.ShapeType.ellipse, {
        x: 8.5,
        y: 4.5,
        w: 1.5,
        h: 1.5,
        fill: { color: slideData.textColor, transparency: 90 }
      });

      // Title
      slide.addText(slideData.title, {
        x: 0.5,
        y: 2.0,
        w: 9.0,
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: slideData.textColor,
        align: 'center',
        valign: 'middle',
        fontFace: 'Arial'
      });

      // Content
      slide.addText(slideData.content, {
        x: 1.0,
        y: 3.8,
        w: 8.0,
        h: 1.0,
        fontSize: 24,
        color: slideData.textColor,
        align: 'center',
        valign: 'middle',
        fontFace: 'Arial'
      });

      // Separator line
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.5,
        y: 5.2,
        w: 7.0,
        h: 0.02,
        fill: { color: slideData.textColor, transparency: 70 }
      });

      // Footer
      slide.addText('Powered by AI Training Platform', {
        x: 0.5,
        y: 5.4,
        w: 9.0,
        h: 0.3,
        fontSize: 12,
        color: slideData.textColor,
        align: 'center',
        fontFace: 'Arial'
      });

      // Slide number
      slide.addText(`${index + 1}`, {
        x: 9.2,
        y: 5.4,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: slideData.textColor,
        align: 'right',
        fontFace: 'Arial'
      });
    });

    // Generate PowerPoint file as Blob
    const pptxBlob = await pptx.write({ outputType: 'blob' });
    return pptxBlob as Blob;
  }

  /**
   * Download the PowerPoint file
   */
  static downloadPowerPoint(blob: Blob, filename: string = 'Presentation.pptx') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate slide preview images (for display)
   */
  static generateSlidePreview(slideData: SlideData): string {
    const svg = `<svg width="1200" height="675" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${slideData.bgColor};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${slideData.bgColor};stop-opacity:0.85"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bgGrad${Date.now()})"/>
  <circle cx="120" cy="120" r="90" fill="${slideData.textColor}" opacity="0.08"/>
  <circle cx="1080" cy="555" r="110" fill="${slideData.textColor}" opacity="0.08"/>
  <text x="600" y="300" font-family="Arial" font-size="52" font-weight="bold" fill="${slideData.textColor}" text-anchor="middle" dominant-baseline="middle">${slideData.title.substring(0, 50)}</text>
  <text x="600" y="400" font-family="Arial" font-size="26" fill="${slideData.textColor}" text-anchor="middle" dominant-baseline="middle" opacity="0.9">${slideData.content.substring(0, 80)}</text>
  <rect x="120" y="570" width="960" height="2" fill="${slideData.textColor}" opacity="0.25"/>
  <text x="600" y="625" font-family="Arial" font-size="14" fill="${slideData.textColor}" text-anchor="middle" opacity="0.65">Powered by AI Training Platform</text>
</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}

