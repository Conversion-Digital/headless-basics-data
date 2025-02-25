export function replacePTagWithDivTag(input: string): string {
    const startTagPattern = /<p>/g;
    const endTagPattern = /<\/p>/g;
    const replacedStartTags = input.replace(startTagPattern, '<div class="flex and flex-col break-normal whitespace-normal text-my-black">');
    return replacedStartTags.replace(endTagPattern, '</div>');
}