import pygame


def move_and_collide(rect: pygame.Rect, velocity: pygame.Vector2, solids: list[pygame.Rect], dt: float):
    """分轴移动并返回水平/垂直碰撞状态。"""
    hit_x = hit_y = False
    rect.x += round(velocity.x * dt)
    for solid in solids:
        if rect.colliderect(solid):
            hit_x = True
            if velocity.x > 0:
                rect.right = solid.left
            elif velocity.x < 0:
                rect.left = solid.right
    rect.y += round(velocity.y * dt)
    for solid in solids:
        if rect.colliderect(solid):
            hit_y = True
            if velocity.y > 0:
                rect.bottom = solid.top
            elif velocity.y < 0:
                rect.top = solid.bottom
    return hit_x, hit_y


def overlaps(a: pygame.Rect, b: pygame.Rect) -> bool:
    return a.colliderect(b)
