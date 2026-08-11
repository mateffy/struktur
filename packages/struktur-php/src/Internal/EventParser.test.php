<?php

use Mateffy\Struktur\Dto\Event;
use Mateffy\Struktur\Internal\EventParser;

describe('EventParser', function () {
    it('parses step event', function () {
        $json = json_encode([
            'event' => 'step',
            'step' => 1,
            'total' => 10,
            'label' => 'extract',
            'timestamp' => 1234567890,
        ]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\StepEvent::class);
        expect($event->step)->toBe(1);
        expect($event->total)->toBe(10);
        expect($event->label)->toBe('extract');
        expect($event->timestamp)->toBe(1234567890);
    });

    it('parses step event with defaults', function () {
        $json = json_encode(['event' => 'step', 'step' => 1]);
        $event = EventParser::parse($json);

        expect($event->total)->toBeNull();
        expect($event->label)->toBe('');
        expect($event->timestamp)->toBeInt();
    });

    it('parses tool_start event', function () {
        $json = json_encode([
            'event' => 'tool_start',
            'toolName' => 'read',
            'toolCallId' => 'call_123',
            'args' => ['path' => '/tmp/test.txt'],
            'timestamp' => 100,
        ]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\ToolStartEvent::class);
        expect($event->toolName)->toBe('read');
        expect($event->toolCallId)->toBe('call_123');
        expect($event->args)->toBe(['path' => '/tmp/test.txt']);
        expect($event->timestamp)->toBe(100);
    });

    it('parses tool_start with defaults', function () {
        $json = json_encode(['event' => 'tool_start', 'toolName' => 'read']);
        $event = EventParser::parse($json);

        expect($event->toolCallId)->toBe('');
        expect($event->args)->toBe([]);
    });

    it('parses tool_end event', function () {
        $json = json_encode([
            'event' => 'tool_end',
            'toolCallId' => 'call_123',
            'result' => ['text' => 'hello'],
            'timestamp' => 100,
        ]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\ToolEndEvent::class);
        expect($event->toolCallId)->toBe('call_123');
        expect($event->result)->toBe(['text' => 'hello']);
        expect($event->error)->toBeNull();
    });

    it('parses tool_end with error', function () {
        $json = json_encode([
            'event' => 'tool_end',
            'toolCallId' => 'call_123',
            'error' => 'timeout',
        ]);
        $event = EventParser::parse($json);

        expect($event->error)->toBe('timeout');
        expect($event->result)->toBeNull();
    });

    it('parses agent_reasoning event', function () {
        $json = json_encode(['event' => 'agent_reasoning', 'thought' => 'I think...', 'timestamp' => 100]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\ReasoningEvent::class);
        expect($event->thought)->toBe('I think...');
    });

    it('parses agent_reasoning with default thought', function () {
        $json = json_encode(['event' => 'agent_reasoning']);
        $event = EventParser::parse($json);

        expect($event->thought)->toBe('');
    });

    it('parses output_set event', function () {
        $json = json_encode(['event' => 'output_set', 'data' => ['key' => 'val'], 'timestamp' => 100]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\OutputSetEvent::class);
        expect($event->data)->toBe(['key' => 'val']);
    });

    it('parses output_set with default data', function () {
        $json = json_encode(['event' => 'output_set']);
        $event = EventParser::parse($json);

        expect($event->data)->toBe([]);
    });

    it('parses output_updated event', function () {
        $json = json_encode(['event' => 'output_updated', 'changes' => ['key' => 'val']]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\OutputUpdatedEvent::class);
        expect($event->changes)->toBe(['key' => 'val']);
    });

    it('parses token_usage event', function () {
        $json = json_encode([
            'event' => 'token_usage',
            'inputTokens' => 100,
            'outputTokens' => 50,
            'totalTokens' => 150,
            'model' => 'openai/gpt-4',
        ]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\TokenUsageEvent::class);
        expect($event->inputTokens)->toBe(100);
        expect($event->outputTokens)->toBe(50);
        expect($event->totalTokens)->toBe(150);
        expect($event->model)->toBe('openai/gpt-4');
    });

    it('parses token_usage with defaults', function () {
        $json = json_encode(['event' => 'token_usage']);
        $event = EventParser::parse($json);

        expect($event->inputTokens)->toBe(0);
        expect($event->outputTokens)->toBe(0);
        expect($event->totalTokens)->toBe(0);
        expect($event->model)->toBeNull();
    });

    it('parses progress event', function () {
        $json = json_encode(['event' => 'progress', 'current' => 3, 'total' => 10, 'percent' => 30.0]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\ProgressEvent::class);
        expect($event->current)->toBe(3);
        expect($event->total)->toBe(10);
        expect($event->percent)->toBe(30.0);
    });

    it('parses progress with null percent', function () {
        $json = json_encode(['event' => 'progress', 'current' => 0, 'total' => 0]);
        $event = EventParser::parse($json);

        expect($event->percent)->toBeNull();
    });

    it('parses retry event', function () {
        $json = json_encode(['event' => 'retry', 'attempt' => 2, 'maxAttempts' => 3, 'reason' => 'fail']);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\RetryEvent::class);
        expect($event->attempt)->toBe(2);
        expect($event->maxAttempts)->toBe(3);
        expect($event->reason)->toBe('fail');
    });

    it('parses retry with null reason', function () {
        $json = json_encode(['event' => 'retry', 'attempt' => 1, 'maxAttempts' => 3]);
        $event = EventParser::parse($json);

        expect($event->reason)->toBeNull();
    });

    it('parses finish event', function () {
        $json = json_encode(['event' => 'finish', 'timestamp' => 999]);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\FinishEvent::class);
        expect($event->timestamp)->toBe(999);
    });

    it('parses failure event', function () {
        $json = json_encode(['event' => 'failure', 'reason' => 'error']);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\FailureEvent::class);
        expect($event->reason)->toBe('error');
    });

    it('parses failure with empty reason', function () {
        $json = json_encode(['event' => 'failure']);
        $event = EventParser::parse($json);

        expect($event->reason)->toBe('');
    });

    it('parses agent_message as StepEvent', function () {
        $json = json_encode(['event' => 'agent_message', 'content' => 'hello']);
        $event = EventParser::parse($json);

        expect($event)->toBeInstanceOf(Event\StepEvent::class);
        expect($event->step)->toBe(0);
        expect($event->total)->toBeNull();
        expect($event->label)->toBe('hello');
    });

    it('throws on invalid json', function () {
        expect(fn () => EventParser::parse('not json'))
            ->toThrow(\JsonException::class);
    });

    it('throws on empty string', function () {
        expect(fn () => EventParser::parse(''))
            ->toThrow(\JsonException::class);
    });

    it('throws on missing event field', function () {
        expect(fn () => EventParser::parse(json_encode(['foo' => 'bar'])))
            ->toThrow(\InvalidArgumentException::class, 'Invalid event line');
    });

    it('throws on scalar json', function () {
        expect(fn () => EventParser::parse('"just a string"'))
            ->toThrow(\InvalidArgumentException::class, 'Invalid event line');
    });

    it('throws on unknown event type', function () {
        expect(fn () => EventParser::parse(json_encode(['event' => 'unknown_event_xyz'])))
            ->toThrow(\InvalidArgumentException::class, 'Unknown event type');
    });

    it('throws on null event value', function () {
        expect(fn () => EventParser::parse(json_encode(['event' => null])))
            ->toThrow(\InvalidArgumentException::class, 'Invalid event line');
    });
});
