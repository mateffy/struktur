<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a
| specific PHPUnit test case class. By default, that class is
| "PHPUnit\Framework\TestCase". We extend it for all tests in src/.
|
*/

pest()->extend(Mateffy\Struktur\Tests\TestCase::class)->in('../src');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet
| certain conditions. The "expect()" function gives you access to a set
| of expectations that you can use to assert different things.
|
*/

expect()->extend('toBeInstanceOf', function (string $class) {
    return $this->value instanceof $class;
});
