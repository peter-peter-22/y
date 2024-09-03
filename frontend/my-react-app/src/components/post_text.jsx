import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { CompositeDecorator, convertToRaw, ContentState, Editor, EditorState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { findHashtags, findMentions } from "/src/components/sync.js";

function getValue(editorState) {
    const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
    const value = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
    return value;
}

//hashtags
function hashtagStrategy(contentBlock, callback, contentState) {
    findWithRegex(findHashtags, contentBlock, callback);
}

//mentions
function mentionStrategy(contentBlock, callback, contentState) {
    findWithRegex(findMentions, contentBlock, callback);
}

//general
function findWithRegex(regex, contentBlock, callback) {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
}

function TextContainer({ children }) {
    return (
        <Box sx={{ width: "100%", "& .DraftEditor-root": { width: "100%" } }}>
            {children}
        </Box>
    );
}

//the updating part of the text editor is separated to prevent unnecessary rerenders
const TextEditorInner = ({ startText, onChange, decorators, ...props }) => {
    const [editorState, setEditorState] = useState(
        () => {
            //initialize starting value
            const contentState = ContentState.createFromText(startText ? startText : "");
            return EditorState.createWithContent(contentState, new CompositeDecorator(decorators));
        }
    );

    useEffect(() => {
        if (onChange) {
            let value = getValue(editorState);
            if (value === "\n")
                value = "";
            onChange(value);
        }
    }, [editorState]);

    return (
        <TextContainer>
            <Editor
                editorState={editorState}
                onChange={setEditorState}
                {...props}
            />
        </TextContainer>
    );
}

const TextEditor = memo(({ maxLetters, startText, ...props }) => {
    //hashtag
    const HashtagSpan = ({ children }) => {
        const theme = useTheme();
        return (
            <span style={{ color: theme.palette.primary.main }}>
                {children}
            </span>
        );
    };

    const markHashtags = {
        strategy: hashtagStrategy,
        component: HashtagSpan
    };

    //mentions
    const MentionSpan = ({ children }) => {
        return (
            <span style={{ color: "inherit", fontWeight: 600 }}>
                {children}
            </span>
        );
    };

    const markMentions = {
        strategy: mentionStrategy,
        component: MentionSpan
    };

    //mark letters above max letter count
    function overflowStrategy(contentBlock, callback, contentState) {
        const text = contentBlock.getText();
        if (text.length > maxLetters)
            callback(maxLetters, maxLetters + text.length);
    }

    const OverflowSpan = ({ children }) => {
        return (
            <mark style={{ background: "#FF000044" }}>
                {children}
            </mark>
        );
    };

    const markOverFlow = {
        strategy: overflowStrategy,
        component: OverflowSpan
    };

    //join the decorators in the right order
    const decorators = [markOverFlow, markHashtags, markMentions];

    return <TextEditorInner startText={startText} decorators={decorators} {...props} />
}, () => true);

const TextDisplayer = (({ text }) => {
    //hashtag
    const HashtagSpan = ({ children }) => {
        const theme = useTheme();
        return (
            <Link
                to={`/search?q=${children[0]?.props?.text.replace("#", "")}`}
                style={{ color: theme.palette.primary.main, cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </Link>
        );
    };

    const markHashtags = {
        strategy: hashtagStrategy,
        component: HashtagSpan
    };

    //mentions
    const MentionSpan = ({ children }) => {
        return (
            <Link
                to={`/search?q=${children[0]?.props?.text.replace("@", "")}`}
                style={{ color: "inherit", fontWeight: 600, cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </Link>
        );
    };

    const markMentions = {
        strategy: mentionStrategy,
        component: MentionSpan
    };

    //join decorators
    const composite = new CompositeDecorator([markHashtags, markMentions]);

    //initialize starting value
    const contentState = ContentState.createFromText(text);
    const editorState = EditorState.createWithContent(contentState, composite);

    return (
        <TextContainer>
            <Editor
                editorState={editorState}
                readOnly={true}
            />
        </TextContainer>
    );
});

export { TextDisplayer, TextEditor };
