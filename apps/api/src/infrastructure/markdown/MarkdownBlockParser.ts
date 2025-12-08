import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

export interface MarkdownBlock {
  type: string;
  content: string;
  position: number;
}

export class MarkdownBlockParser {
  async parse(content: string): Promise<MarkdownBlock[]> {
    const tree = unified().use(remarkParse).parse(content);
    const blocks: MarkdownBlock[] = [];
    let index = 0;

    visit(tree, (node) => {
      if (
        node.type === 'paragraph' ||
        node.type === 'heading' ||
        node.type === 'code' ||
        node.type === 'list' ||
        node.type === 'blockquote'
      ) {
        const text = this.extractText(node);
        if (text.trim().length === 0) return;
        blocks.push({
          type: node.type,
          content: text,
          position: index++,
        });
      }
    });

    return blocks;
  }

  private extractText(node: any): string {
    if (typeof node.value === 'string') {
      return node.value;
    }

    if (Array.isArray(node.children)) {
      return node.children.map((child) => this.extractText(child)).join(' ');
    }

    return '';
  }
}
